import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import {  superValidate } from 'sveltekit-superforms/server';
import { fail, redirect, type Load } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN} from '$env/static/private';
import { db } from '$lib/server/db';
import { cvEvaluation, file as fileTable } from '$lib/server/db/schema';
import { and, desc, eq } from 'drizzle-orm';
import { generateObject } from 'ai';
import { modelAnthropic } from '$lib/server/anthropic';
import  { EvaluationResultSchema, EvaluationResultsSchema } from '$lib/schemas';

// ✅ Only validate the filename (Superforms does not handle `File` objects)
const schema = z.object({
	filename: z.string().min(1, 'Please upload a file.'),
	url: z.string().optional()
});


const aspects = [
    { key: 'structure', prompt: 'Evaluate the structure and logical order of the CV.' },
    { key: "writing", prompt: "Analyze the clarity, conciseness, and grammar of the CV." },
    { key: "spelling", prompt: "Detect and report any spelling and grammatical errors in the CV." },
    { key: "relevance", prompt: "Assess if the CV content is relevant to the job position." },
    { key: "keywords", prompt: "Check if the CV includes essential industry-specific keywords." },
    { key: "formatting", prompt: "Evaluate the design, readability, and overall presentation of the CV." },
    { key: "achievements", prompt: "Determine if the CV highlights achievements with quantifiable results." },
    { key: "customization", prompt: "Analyze if the CV is specifically tailored for the job application." }
];

const checkSignin = async (locals) => {
    const userAuth = await locals.auth?.(); // Ensure `auth` exists before calling it
    if (!userAuth?.user) {
        console.log('Unauthorized access');
        // REDIRECT TO THE SIGNIN PAGE WITH CORRECT STATUS CODE
        throw redirect(302, '/login'); 
    }
    return userAuth.user;
};

    

export const load: Load = async (event) => {
    const { locals } = event; // ✅ Extract `locals` from `event`

    const user = await checkSignin(locals);
    const userId = user.id;

	// GET THE FILES BY THE USER ID FROM THE DATABASE
	const res = await db
		.select()
		.from(fileTable)
		.where(eq(fileTable.userId, userId))
		.orderBy(desc(fileTable.uploadedAt));

	console.log(res);

	return {
		form: await superValidate(zod(schema)),
		files: res
	};
};

export const actions = {
	upload: async ({ request, locals }) => {
		console.log('Upload request received');
		
        const user = await checkSignin(locals);
        const userId = user.id;

		const formData = await request.formData();
		const file = formData.get('file');

		// ✅ Ensure a valid file is uploaded
		if (!(file instanceof File) || !file.name) {
			return fail(400, {
				form: await superValidate(zod(schema)),
				error: 'Invalid file. Please upload a valid file.'
			});
		}

		// ✅ Validate only the filename
		const form = await superValidate({ filename: file.name }, zod(schema));
		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			// ✅ Upload file to Vercel Blob
			const blob = await put(file.name, file, {
				access: 'public',
				token: BLOB_READ_WRITE_TOKEN
			});

			console.log('Upload successful:', blob.url);
            console.log("userId", userId)

			// ✅ Return the URL inside `message()`
			form.data.url = blob.url;

			// UPLOAD THE FILE BY THE USER ID TO THE DATABASE
			const res = await db
				.insert(fileTable)
				.values({
					userId: userId,
					fileUrl: blob.url,
					originalName: file.name
				})
				.returning();
			//console.log(res)

			return { form };
		} catch (err) {
			console.error('Upload failed:', err);
			return fail(500, { form, error: 'Upload failed' });
		}
	},
	evalCurriculum: async ({ request, locals }) => {
		const formData = await request.formData();
		const fileId = formData.get('fileId');

        const user = await checkSignin(locals);
        const userId = user.id;

		// ✅ Ensure a valid fileId is sent
        if (!fileId) {
            return fail(400, { error: 'Invalid request' });
        }

		// ✅ Validate that the file belongs to the user
		const fileDb = await db.query.file.findFirst({
			where: and(eq(fileTable.userId, userId), eq(fileTable.id, fileId))
		});
		if (!fileDb) {
			return fail(400, { error: 'Invalid fileId' });
		}


        // ✅ Check if evaluation already exists to prevent redundant AI calls
        const cachedEvaluations = await db.query.cvEvaluation.findMany({
            where: eq(cvEvaluation.fileId, fileId)
        });

        if (cachedEvaluations.length > 0) {
			console.log('Cached evaluations found:', cachedEvaluations);
			const res = cachedEvaluations.map((evaluation) => ({
				key: evaluation.aspect,
				result: { text: evaluation.feedback, score: evaluation.score }
			}));
			// PARSE WITH ZOD
			const parsed = EvaluationResultsSchema.parse(res);
			console.log('Parsed:', parsed);
            return { success: true, results: parsed };
        }


		const response = await fetch(fileDb.fileUrl);
		if (!response.ok) {
			return fail(500, { error: 'Failed to fetch the CV file' });
		}
		const fileBlob = await response.blob();

		const fileType = fileBlob.type.split('/')[1];

		async function convertBlobToBuffer(blob) {
			const arrayBuffer = await blob.arrayBuffer();
			return Buffer.from(arrayBuffer);
		}

		// Prepare common data needed for all aspect evaluations
		let commonData = null;
		if (['png', 'jpg', 'jpeg'].includes(fileType)) {
			commonData = { type: 'image', value: fileDb.fileUrl };
		} else {
			const fileBuffer = await convertBlobToBuffer(fileBlob);
			commonData = { type: 'file', value: fileBuffer, mimeType: fileBlob.type };
		}

		// CHECK THAT IS A CURRICULUM VITAE AND NOT SOMETHING ELSE
		// MAKE A REQUEST TO CHECK IF THE FILE IS A CURRICULUM VITAE
		// IF NOT RETURN AN ERROR
		const messages = [
			{
				role: 'system',
				content:
					'Your job is to determine if the file is a Curriculum Vitae. The output has to be a boolean value.'
			},
			{
				role: 'user',
				content:
					commonData.type === 'image'
						? [{ type: 'image', image: commonData.value }] // ✅ Direct object, no array
						: [{ type: 'file', data: commonData.value, mimeType: commonData.mimeType }] // ✅ Direct object, no array
			}
		];

		const checkItsCv = await generateObject({
			model: modelAnthropic,
			schema: z.object({
				isCv: z.boolean().describe('Is the file a Curriculum Vitae?')
			}),
			messages
		});

		console.log('Is CV:', checkItsCv.object.isCv);

		if (checkItsCv.object.isCv) {
			// Create an array of promises, one for each aspect evaluation
			const evaluationPromises = aspects.map(async (aspect) => {
				const messages = [
					{ role: 'system', content: `You are analyzing a CV for the aspect: "${aspect.key}".` },
					{
						role: 'user',
						content: `Analyze the following CV based on "${aspect.prompt}". Provide a structured response with:\n - **text**: A short evaluation of this aspect.\n - **score**: A score from 1 (very poor) to 10 (excellent).`
					}
				];

				// Add the CV content to the messages
				// if (commonData.type === 'image') {
				// 	messages.push({
				// 		role: 'user',
				// 		content: [{ type: 'image', image: commonData.value }]
				// 	});
				// } else {
				// 	messages.push({
				// 		role: 'user',
				// 		content: [{ type: 'file', data: commonData.value, mimeType: commonData.mimeType }]
				// 	});
				// }
                // IMPROVEMENTE BY ADDING THE FILE CONTENT TO THE MESSAGES
                messages.push({
                    role: 'user',
                    content: commonData.type === 'image'
                        ? [{ type: 'image', image: commonData.value }] // ✅ Direct object, no array
                        : [{ type: 'file', data: commonData.value, mimeType: commonData.mimeType }] // ✅ Direct object, no array
                });


				try {
					const response = await generateObject({
						model: modelAnthropic,
						schema: z.object({
							text: z
								.string()
								.describe(`Feedback on ${aspect.key}. Keep your response short, max 500 characters`)
								.max(500),
							score: z.number().min(1).max(10).describe(`Score for ${aspect.key} (1-10)`)
						}),
						messages
					});

					return { key: aspect.key, result: response.object };
				} catch (error) {
					console.error(`Error analyzing ${aspect.key}:`, error);
					return { key: aspect.key, result: { text: 'Analysis failed', score: 0 }, error };
				}
			});

			// Wait for all promises to resolve
			const evaluationResults = await Promise.all(evaluationPromises);

			// Convert array of results to the expected object format
			type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
			const results: EvaluationResult[] = evaluationResults.map(({ key, result }) => ({
				key,
				result
			}));

			// Save the evaluation results to the database
			const insertResults = results.map((result) => ({
				fileId,
				aspect: result.key,
				score: result.result.score,
				feedback: result.result.text
			}));
			await db.insert(cvEvaluation).values(insertResults);

			console.log('Final results:', results);
			return { success: true, results };
		} else {
			return { success: false, error: 'The file is not a Curriculum Vitae' };
		}
	} //
};
