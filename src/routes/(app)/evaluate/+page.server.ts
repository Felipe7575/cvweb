import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import {  message, superValidate } from 'sveltekit-superforms/server';
import { fail, redirect, type Load } from '@sveltejs/kit';
import { put } from '@vercel/blob';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import { db } from '$lib/server/db';
import { credit, cvEvaluation, file, file as fileTable } from '$lib/server/db/schema';
import { and, asc, desc, eq, sql } from 'drizzle-orm';
import { generateObject } from 'ai';
import { modelAnthropic } from '$lib/server/anthropic';
import  { EvaluationResultSchema, EvaluationResultsSchema } from '$lib/schemas';
import {user as userTable} from '$lib/server/db/schema';
import { PUBLIC_CREDITS_PER_EVAL } from '$env/static/public';
import { getBrowserLanguage } from '$lib/utils';

// ✅ Only validate the filename (Superforms does not handle `File` objects)
const schemaUpload = z.object({
	filename: z.string().optional(),
	url: z.string().optional(),
	file: z.any()
});
const schemaDelete = z.object({
	fileId: z.string().min(1, 'Invalid fileId')
});

const schemaInspect = z.object({
	desiredPosition: z.string().min(1, 'The desired position is required'),
	skills: z.string(),
	country: z.string().min(1, 'The country is required'),
	language: z.string().min(1, 'The language is required'),
	tools: z.string(),
	fileId: z.string().min(1, 'The file is required'),
	analyseAgain: z.boolean(),
});

const countries = [
	{name:"Antigua y Barbuda",language:"Inglés"},
	{name:"Argentina",language:"Español"},
	{name:"Bahamas",language:"Inglés"},
	{name:"Barbados",language:"Inglés"},
	{name:"Belice",language:"Inglés"},
	{name:"Bolivia",language:"Español"},
	{name:"Brasil",language:"Portugués"},
	{name:"Canadá",language:"Inglés"},
	{name:"Chile",language:"Español"},
	{name:"Colombia",language:"Español"},
	{name:"Costa Rica",language:"Español"},
	{name:"Cuba",language:"Español"},
	{name:"Dominica",language:"Inglés"},
	{name:"Ecuador",language:"Español"},
	{name:"El Salvador",language:"Español"},
	{name:"Estados Unidos",language:"Inglés"},
	{name:"Granada",language:"Inglés"},
	{name:"Guatemala",language:"Español"},
	{name:"Guyana",language:"Inglés"},
	{name:"Haití",language:"Criollo haitiano"},
	{name:"Honduras",language:"Español"},
	{name:"Jamaica",language:"Inglés"},
	{name:"México",language:"Español"},
	{name:"Nicaragua",language:"Español"},
	{name:"Panamá",language:"Español"},
	{name:"Paraguay",language:"Español"},
	{name:"Perú",language:"Español"},
	{name:"República Dominicana",language:"Español"},
	{name:"San Cristóbal y Nieves",language:"Inglés"},
	{name:"Santa Lucía",language:"Inglés"},
	{name:"San Vicente y las Granadinas",language:"Inglés"},
	{name:"Surinam",language:"Neerlandés"},
	{name:"Trinidad y Tobago",language:"Inglés"},
	{name:"Uruguay",language:"Español"},
	{name:"Venezuela",language:"Español"},
	{name:"Albania",language:"Albanés"},
	{name:"Alemania",language:"Alemán"},
	{name:"Andorra",language:"Catalán"},
	{name:"Armenia",language:"Armenio"},
	{name:"Austria",language:"Alemán"},
	{name:"Azerbaiyán",language:"Azerí"},
	{name:"Bélgica",language:"Neerlandés"},
	{name:"Bielorrusia",language:"Bielorruso"},
	{name:"Bosnia y Herzegovina",language:"Bosnio"},
	{name:"Bulgaria",language:"Búlgaro"},
	{name:"Chipre",language:"Griego"},
	{name:"Croacia",language:"Croata"},
	{name:"Dinamarca",language:"Danés"},
	{name:"Eslovaquia",language:"Eslovaco"},
	{name:"Eslovenia",language:"Esloveno"},
	{name:"España",language:"Español"},
	{name:"Estonia",language:"Estonio"},
	{name:"Finlandia",language:"Finés"},
	{name:"Francia",language:"Francés"},
	{name:"Georgia",language:"Georgiano"},
	{name:"Grecia",language:"Griego"},
	{name:"Hungría",language:"Húngaro"},
	{name:"Irlanda",language:"Inglés"},
	{name:"Islandia",language:"Islandés"},
	{name:"Italia",language:"Italiano"},
	{name:"Kazajistán",language:"Kazajo"},
	{name:"Letonia",language:"Letón"},
	{name:"Liechtenstein",language:"Alemán"},
	{name:"Lituania",language:"Lituano"},
	{name:"Luxemburgo",language:"Luxemburgués"},
	{name:"Malta",language:"Maltés"},
	{name:"Moldavia",language:"Rumano"},
	{name:"Mónaco",language:"Francés"},
	{name:"Montenegro",language:"Montenegrino"},
	{name:"Noruega",language:"Noruego"},
	{name:"Países Bajos",language:"Neerlandés"},
	{name:"Polonia",language:"Polaco"},
	{name:"Portugal",language:"Portugués"},
	{name:"Reino Unido",language:"Inglés"},
	{name:"República Checa",language:"Checo"},
	{name:"Rumania",language:"Rumano"},
	{name:"Rusia",language:"Ruso"},
	{name:"San Marino",language:"Italiano"},
	{name:"Serbia",language:"Serbio"},
	{name:"Suecia",language:"Sueco"},
	{name:"Suiza",language:"Alemán"},
	{name:"Ucrania",language:"Ucraniano"},
	{name:"Vaticano",language:"Latín"}
  ]
  

const acceptedLanguages = [
	"English", "French", "Spanish", "Arabic", "Portuguese", "German", 
	"Bengali", "Chinese", "Hindi", "Russian", "Urdu", "Japanese", 
	"Italian", "Turkish", "Swahili", "Persian", "Polish", "Dutch", 
	"Georgian", "Greek", "Czech", "Belarusian", "Catalan", "Azerbaijani", 
	"Khmer", "Danish", "Finnish", "Estonian", "Greenlandic", "Chamorro"
  ].sort();

  const evaluationGroups = [
    {
        key: "content",
        aspects: [
            { key: "writing", prompt: "Analyze the clarity, conciseness, and grammar of the CV." },
            { key: "spelling", prompt: "Detect and report any spelling and grammatical errors in the CV." },
            { key: "relevance", prompt: "Assess if the CV content is relevant to the job position." },
            { key: "keywords", prompt: "Check if the CV includes essential industry-specific keywords." },
            { key: "achievements", prompt: "Determine if the CV highlights achievements with quantifiable results." }
        ]
    },
    {
        key: "structure",
        aspects: [
            { key: "structure", prompt: "Evaluate the structure and logical order of the CV." },
            { key: "formatting", prompt: "Evaluate the design, readability, and overall presentation of the CV." },
            { key: "customization", prompt: "Analyze if the CV is specifically tailored for the job application." }
        ]
    }
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
	// const res = await db
	// 	.select()
	// 	.from(fileTable)
	// 	.where(eq(fileTable.userId, userId))
	// 	.orderBy(asc(fileTable.uploadedAt));
	console.log(1)
	const res = await db.query.file.findMany({
		where: eq(fileTable.userId, userId),
		with:{
			cvEvaluations: {
				
			}
		},
		orderBy: [asc(fileTable.uploadedAt)]
	});
	console.log(2)




	return {
		formUpload: await superValidate(zod(schemaUpload)),
		formDelete: await superValidate(zod(schemaDelete)),
		formInspect: await superValidate(zod(schemaInspect)),
		files: res,
		acceptedLanguages,
		countries
	};
};

export const actions = {
	upload: async (event) => {
		console.log('Upload request received');
		
		const form = await superValidate(event, zod(schemaUpload));
		const { file } = form.data;
		console.log(file)
		console.log(form)

		const { locals } = event;
		const user = await checkSignin(locals);
        const userId = user.id;
		

		// ✅ Ensure a valid file is uploaded
		if (!(file instanceof File) || !file.name) {
			console.log('Invalid file:', file);
			return message(form, 
				{success: false,message:'Invalid file'}, 
				{status: 403}
			);
		}
		if (!form.valid) {
			//return fail(400, { form });
			return message(form, 
				{success: false,message:'Invalid form'}, 
				{status: 403}
			);
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

			//return message(form, 'Upload successful')
			return  message(form,
				{success: true, message: 'Upload successful'},
			);


		} catch (err) {
			console.error('Upload failed:', err);
			//return fail(500, { form, error: 'Upload failed' });
			return message(form, 
				{success: false,message:'Upload failed'}, 
				{ status: 403 }
			);
		}
	},
	delete: async (event) => {
		// SUPER VALIDATE THE FORM
		const form = await superValidate(event,zod(schemaDelete));
		console.log('Delete request:', form);
		if (!form.valid) {
			//return fail(400, { form });
			return message(form, 
				{success: false,message:'Invalid form'},
				{status: 403}
			);
		}

		const { locals } = event;
		const user = await checkSignin(locals);
		const userId = user.id;
		
		console.log("✅ Checked the user");
		try{
		// DELETE THE FILE BY THE USER ID FROM THE DATABASE
			await db.delete(fileTable).where(and(eq(fileTable.userId, userId), eq(fileTable.id, form.data.fileId)));
		}
		catch(err){
			//return fail(500, { error: 'Failed to delete the file' });
			return message(
				form, 
				{success: false, message: 'Failed to delete the file'},
				{status: 403}
			);
		}
		console.log("✅ Deleted the file")
		
		return { form }
	},



	evalCurriculum: async (event) => {
		const form = await superValidate(event, zod(schemaInspect));
		if (!form.valid) {
			return message(form, 'Invalid form');
		}

		// GET THE USER LANGUAGE
		const language = getBrowserLanguage(event);

		console.dir(form.data, { depth: null });

		const locals = event.locals;
        const user = await checkSignin(locals);
        const userId = user.id;
		const fileId = form.data.fileId;

		// ✅ Ensure a valid fileId is sent
        if (!fileId) {
            return message(form, 
				{ success: false, message: 'Invalid fileId' },
				{ status: 403 }
			);
        }

		// ✅ Validate that the file belongs to the user
		const fileDb = await db.query.file.findFirst({
			where: and(eq(fileTable.userId, userId), eq(fileTable.id, fileId))
		});
		if (!fileDb) {
			return message(form, 
				{ success: false, message: 'File not found' },
				{ status: 403 }
			);
		}
		console.log("✅ Checked that the file belongs to the user")

		// If the user does not want to re-analyze the file, check if the evaluation already exists
		if (!form.data.analyseAgain) {
			// ✅ Check if evaluation already exists to prevent redundant AI calls
			const cachedEvaluations = await db.query.cvEvaluation.findMany({
				where: eq(cvEvaluation.fileId, fileId)
			});
			console.log("✅ Checked if the evaluation already exists: ", !cachedEvaluations? "Yes" : "No")
			
			if (cachedEvaluations.length > 0) {
				console.log('Cached evaluations found:', cachedEvaluations);
				const res = cachedEvaluations.map((evaluation) => ({
					key: evaluation.aspect,
					result: { text: evaluation.feedback, score: evaluation.score }
				}));
				// PARSE WITH ZOD
				const parsed = EvaluationResultsSchema.parse(res);
				return message(form, { success: true, results: parsed });
				
			}
		}

		// DELETE THE OLD EVALUATION RESULTS
		await db.delete(cvEvaluation).where(eq(cvEvaluation.fileId, fileId));

		// CHECK IF THE USER HAS ENOUGH CREDITS
		const userCredit = await db.query.credit.findFirst({
			where: eq(credit.userId, userId)
		});

		if (!userCredit || userCredit.balance < Number(PUBLIC_CREDITS_PER_EVAL)) {
			return message(form, 
				{ success: false, 
				  message: 'Insufficient credits',
				  enoughBalance: false,
				},
				{ status: 403 }
			);
		}


		
		const response = await fetch(fileDb.fileUrl);
		if (!response.ok) {
			//return fail(500, { error: 'Failed to fetch the CV file' });
			return message(form, 
				{ success: false, message: 'Failed to fetch the CV file' },
				{ status: 403 }
			);
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

		console.log("✅ Get blob data")

		// REDUCE THE CREDIT BALANCE OF THE USER
		await db.update(credit)
		.set({ balance: sql`${credit.balance} - ${PUBLIC_CREDITS_PER_EVAL}` }) // Decrement balance
		.where(eq(credit.userId, userId)); // Ensure we're filtering by userId from the credit table


		console.log("✅ Updated the credit balance")
		

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

		console.log('✅ Is CV:', checkItsCv.object.isCv);

		if (checkItsCv.object.isCv) {
			// Create an array of promises, one for each aspect evaluation
			const evaluationPromises = evaluationGroups.map(async (aspect) => {
				const messages = [
					{
						role: 'system',
						content: `You are analyzing a CV. Evaluate the following aspects and return structured feedback for each one. 
						Here are some details that might be helpful:
						- Role to apply: ${form.data.desiredPosition}
						${form.data.skills.length > 2 ? `- Skills: ${form.data.skills}` : ""}
						- Country: ${form.data.country}
						- Language of the job: ${form.data.language}
						${form.data.tools.length > 2 ? `- Tools: ${form.data.tools}` : ""}
				
						The response must be in: ${language}.
						Provide feedback for each aspect in a structured format.`
					},
					{
						role: 'user',
						content: `Analyze the following CV based on these aspects:
						${aspect.aspects.map(group => 
							`- **${group.key}**: ${group.prompt}`
						).join("\n")}
				
						Return a structured JSON response with:
						- **text**: A short evaluation (max 500 characters).
						- **score**: A score from 1 (very poor) to 10 (excellent).`
					}
				];

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
							data: z.array(z.object({
								aspect: z.string(),
								text: z.string(),
								score: z.number().int().min(1).max(10)
							}))
						}),
						messages
					});
					return response.object.data
					//return message(form, { key: aspect.key, result: response.object });
				} catch (error) {
					console.error(`Error analyzing ${aspect.key}:`, error);
					//return { key: aspect.key, result: { text: 'Analysis failed', score: 0 }, error };
					return  { key: aspect.key, result: { text: 'Analysis failed', score: 0 }};
				}
			});

			// Wait for all promises to resolve
			const evaluationResults = await Promise.all(evaluationPromises);
			// Convert array of results to the expected object format
		
			function parseEvaluationResults(evaluationResults) {
				return evaluationResults.flatMap((evaluation, index) =>
					evaluation.map(aspect => ({
						key: aspect.aspect || `unknown_aspect_${index}`,
						result: {
							text: aspect.text,
							score: aspect.score
						}
					}))
				);
			}
			
			type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
			const results: EvaluationResult[] = parseEvaluationResults(evaluationResults)

			console.log("✅ Evaluation results");

			const summaryMessages = [
				{
					role: 'system',
					content: `You are an expert CV evaluator. Summarize the following evaluation results in a structured and concise way. 
					Provide a final overall summary that gives constructive feedback, highlights strengths, and suggests improvements. 
					The response must be in: ${language}.`
				},
				{
					role: 'user',
					content: `Here are the evaluation results of a CV for the role: "${form.data.desiredPosition}":
					
					${results.map(result => `- **${result.key}**: ${result.result.text} (Score: ${result.result.score}/10)`).join("\n")}
			
					Provide a well-structured summary that includes:
					- **Overall impression**
					- **Key strengths**
					- **Areas for improvement**
					- **Final recommendation**
					Max length 500 characters
					`
				
				}
			];
			
			try {
				const summaryResponse = await generateObject({
					model: modelAnthropic,
					schema: z.object({
						summary: z.string().describe("A concise summary of the CV evaluation").max(500),
						score: z.number().int().min(1).max(10)
					}),
					messages: summaryMessages
				});
			
				console.log("✅ Summary generated:");
				results.push({
					key:"sumary",
					result:{
						text:summaryResponse.object.summary,
						score: summaryResponse.object.score
					}
				})
			} catch (error) {
				console.error("❌ Error generating summary:", error);
				return message(form, { 
					success: false, 
					message: "Failed to generate summary" 
				}, { status: 500 });
			}

			// Save the evaluation results to the database
			const insertResults = results.map((result) => ({
				fileId,
				aspect: result.key,
				score: result.result.score,
				feedback: result.result.text
			}));
			await db.insert(cvEvaluation).values(insertResults);

			console.log("✅ Inserted the evaluation results")

			return message(form, { success: true, results });
		} else {
			return message(form, 
				{ success: false, message: 'The file is not a Curriculum Vitae' },
				{ status: 403 }
			);
		}
	} //
};
