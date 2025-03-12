<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { z } from 'zod';
	import {
		AspectResultSchema,
		EvaluationResultSchema,
		EvaluationResultsSchema,
		filesZodSchema
	} from '$lib/schemas';
	import { deserialize } from '$app/forms';
	import { writable } from 'svelte/store';
	import { Fa } from 'svelte-fa';
	import { faEye, faCheckCircle, faTrash, faCoins } from '@fortawesome/free-solid-svg-icons';
	import { PUBLIC_CREDITS_PER_EVAL } from '$env/static/public';
	import { goto, invalidateAll } from '$app/navigation';
	import toast from 'svelte-french-toast';

	// Types
	type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

	// Constants
	const ACCEPTED_FILE_TYPES = ['.pdf', '.jpg', '.jpeg', '.png'];
	const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png'];
	const SUPPORTED_PDF_EXTENSION = 'pdf';

	let { data }: PageProps = $props();

	// Superforms setup
	const {
		form: formUpload,
		message: messageUpload,
		enhance: enhanceUpload,
		errors: errorsUpload
	} = superForm(data.formUpload, {
		resetForm: false,
		invalidateAll: true,
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				console.log(f.errors);
				// Show success notification
				showSuccessNotification('File uploaded successfully');
			} else {
				console.log(f);
				console.log(f.errors);
				// Show failure notification
				showFailureNotification('Error uploading file');
			}
		}
	});

	const {
		form: formDelete,
		message: messageDelete,
		enhance: enhanceDelete,
		errors: errorsDelete
	} = superForm(data.formDelete, {
		resetForm: true,
		invalidateAll: true,
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				console.log(f.errors);
				// Show success notification
				showSuccessNotification('File deleted successfully');
			} else {
				console.log(f);
				console.log(f.errors);
				// Show failure notification
				showFailureNotification('Error deleting file');
			}
		}
	});

	// Store for selected file
	let selectedFile: z.infer<typeof filesZodSchema> | null = $state(null);
	let generatingReport = $state(false);
	let isLoading = $state(false);
	let errorMessage: string | null = $state(null);
	let resultsSelectedCv: EvaluationResult[] | null = $state(null);

	// Determine file type
	const getFileType = (url: string) => {
		if (!url) return '';
		const extension = url.split('.').pop().toLowerCase();
		if (SUPPORTED_IMAGE_EXTENSIONS.includes(extension)) return 'image';
		if (extension === SUPPORTED_PDF_EXTENSION) return 'pdf';
		return 'other';
	};

	// Modal handling
	const showFilePreview = (file: z.infer<typeof filesZodSchema>) => {
		selectedFile = file;
		//document.getElementById('fileModal').showModal();
	};
	const closeModal = () => {
		selectedFile = null;
		//document.getElementById('fileModal').close();
	};

	// Handle file evaluation
	const evalCurriculum = async (fileId: string) => {
		const form = new FormData();
		form.append('fileId', fileId);

		// CHECK IF ALREADY EVALUATING
		if (generatingReport) return;
		// CHECK THAT CREDITS ARE AVAILABLE
		// balance - PUBLIC_CREDITS_PER_EVAL > 0
		// MESSAGE USER TO ADD CREDITS
		if (
			data.user?.credit?.[0]?.balance &&
			data.user?.credit?.[0]?.balance - Number(PUBLIC_CREDITS_PER_EVAL) < 0
		) {
			showFailureNotification(
				'You do not have enough credits to evaluate this CV. Please add credits to your account.'
			);

			setTimeout(() => {
				goto('/checkout');
			}, 2000);


			return;
		}
		try {
			generatingReport = true;

			// Scroll to analysis section
			const analysisSection = document.getElementById('analysis-section');
			if (analysisSection) {
				analysisSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}

			const res = await fetch('?/evalCurriculum', {
				method: 'POST',
				body: form
			});

			if (!res.ok) throw new Error(`Network response was not ok: ${res.statusText}`);

			const dataText = await res.text();
			const results = deserialize(dataText);
			errorMessage = null;

			if (results.status === 200 && results.type === 'success') {
				console.log('Curriculum Evaluated Successfully');

				const resultsEval = results?.data?.form?.message?.results;
				console.log('Results:', resultsEval);
				const res = EvaluationResultsSchema.safeParse(resultsEval);
				if (res.success) {
					resultsSelectedCv = res.data;
					showSuccessNotification('Curriculum evaluated successfully');
				} else {
					
					showFailureNotification('Error parsing curriculum');
				}
			} else {
				// GET ERROR MESSAGE
				const message = results?.data?.form?.message?.message;
				console.log('Error Message:', message);
				toast.error(
					message ?? 'An error occurred while evaluating the curriculum. Please try again.'
				);

				if(results?.data?.form?.message?.enoughBalance){
					setTimeout(() => {
						goto('/checkout');
					}, 3000);
				}

			}
		} catch (error) {
			console.error('Fetch error:', error);
		} finally {
			generatingReport = false;
			// WAIT A FEW SECONDS AND SCROLL TO RESULTS

			invalidateAll();
		}
	};
	$inspect(data);

	// Handle outside click on modal
	const handleOutsideClick = (e: MouseEvent) => {
		if (e.target === document.getElementById('fileModal')) {
			closeModal();
		}
	};

	const showSuccessNotification = (text: string) => {
		toast.success(text);
	};
	const showFailureNotification = (text: string) => {
		toast.error(text);
	};
	const showLoadingNotification = (text: string) => {
		toast.loading(text);
	};

	let files = $derived.by(() =>
		data.files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
	);
	let user = $derived(data.user);
	let balance = $derived(data.user?.credit?.[0]?.balance);
	$inspect(balance);
</script>

<div
	class="mx-auto flex h-full w-full flex-col gap-4 overflow-y-auto md:w-[98%] md:flex-row md:justify-center lg:w-[95%] xl:w-[85%]"
>
	<!-- Left Column - Current Interface -->
	<div class="flex flex-col gap-4 md:w-1/2">
		<!-- Upload Section -->
		<div class="card bg-base-100 mx-auto w-full p-5 shadow-lg md:p-2 lg:p-6">
			<h2 class="mb-4 text-center text-xl font-bold">Upload Your CV</h2>
			<form
				use:enhanceUpload
				method="POST"
				enctype="multipart/form-data"
				action="?/upload"
				{...formUpload}
				class="form-control"
			>
				<input
					type="file"
					name="file"
					accept={ACCEPTED_FILE_TYPES.join(',')}
					class="file-input file-input-bordered w-full"
					bind:value={$formUpload.file}
				/>
				<button type="submit" class="btn btn-primary mt-4 w-full">Upload CV</button>
			</form>
		</div>
		{#key balance}
			{#if balance != undefined && balance >= 0}
				<button 
					class="card bg-base-100 mx-auto w-full shadow-lg hover:p-1"
					onclick={()=> goto('/checkout')}	
				>
					
					<div class="card-body flex flex-col items-center  ">
						<div class="flex w-full flex-row px-2 justify-between">
							<div class="flex items-center gap-3">
								<span class="text-primary text-3xl">
									<Fa icon={faCoins} />
								</span>
								<span class="text-lg font-bold">Credits</span>
							</div>
							<div class="text-lg font-medium {balance == 0 ? 'text-red-500' : ''}">
								{balance.toFixed(0) || 0}
							</div>
						</div>
						<p class="text-gray-500 text-sm">Add more credits to your account by clicking here.</p>
					</div>
				</button>
			{/if}
		{/key}

		
		{#if files}
			<!-- Uploaded Files Section -->
			<div
				class="card bg-base-100 mx-auto w-full flex-grow flex-col overflow-x-hidden p-5 shadow-lg md:p-2 lg:p-6"
			>
				<h2 class="mb-4 text-center text-xl font-bold">Uploaded CV</h2>
				<!-- Scrollable Content -->
				<div class="flex-grow  ">
					<ul class="bg-base-200  md:h-fit rounded-box shadow-md">
						{#key files}
							{#each files as file}
								<li
									class="hover:bg-base-300 flex items-center justify-between gap-2 rounded-lg p-3 sm:gap-4"
								>
									<!-- Upload Date -->
									<span class="badge badge-outline md:text-md text-xs"
										>{new Date(file.uploadedAt).toISOString().split('T')[0]}</span
									>

									<!-- File Name (Truncated if Too Long) -->
									<span class="text-md flex-1 truncate md:text-lg">{file.originalName}</span>

									<!-- Action Buttons (Icons) -->
									<div class="flex gap-1">
										<button
											class="btn btn-xs btn-secondary tooltip tooltip-top"
											data-tip="View"
											onclick={() => showFilePreview(file)}
										>
											<Fa icon={faEye} />
										</button>

										<button
											class="btn btn-xs btn-primary tooltip tooltip-top"
											data-tip="Evaluate"
											onclick={() => evalCurriculum(file.id)}
										>
											<Fa icon={faCheckCircle} />
										</button>

										<!-- Delete Form -->
										<form
											use:enhanceDelete
											class="m-0 inline-block h-fit p-0"
											method="POST"
											action="?/delete"
											{...formDelete}
											onsubmit={() => console.log('Submitting file delete form with ID:', file.id)}
										>
											<input type="hidden" name="fileId" value={file.id} />
											<button
												type="submit"
												class="btn btn-xs btn-error tooltip tooltip-top m-0"
												data-tip="Delete"
											>
												<Fa icon={faTrash} />
											</button>
										</form>
									</div>
								</li>
							{/each}
						{/key}
					</ul>	
				
				</div>

			</div>
			
		{/if}
		
	</div>

	<!-- Right Column - Results Section -->
	<div class="flex h-full flex-col md:w-1/2">
		<div
			id="analysis-section"
			class="card bg-base-100 flex h-fit w-full flex-col p-5 shadow-lg md:h-full md:p-4 lg:p-6"
		>
			<h2 class="mb-4 flex-shrink-0 text-center text-xl font-bold">Analysis Results</h2>

			<div class="flex-grow pr-2 md:overflow-y-auto">
				{#if !generatingReport}
					{#if !errorMessage}
						{#if resultsSelectedCv}
							<div class="grid grid-cols-1 gap-4">
								{#each resultsSelectedCv as result}
									<div class="card bg-base-200 p-4 shadow-xl">
										<h2 class="text-lg font-bold capitalize">{result.key}</h2>

										{#if result.error}
											<p class="text-red-500">Error processing this aspect.</p>
										{:else}
											<p class="text-gray-600">{result.result.text}</p>
											<div class="mt-2 flex items-center gap-2">
												<progress
													class="progress progress-primary w-56"
													value={result.result.score}
													max="10"
												></progress>
												<span class="badge badge-outline">{result.result.score}/10</span>
											</div>
										{/if}
									</div>
								{/each}
								<div
									class="from-base-100 pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-gradient-to-t to-transparent"
								></div>
							</div>
						{:else}
							<div class="flex h-full min-h-64 items-center justify-center">
								<p class="text-center text-gray-500">
									Select a CV and click "Evaluate" to see analysis results here.
								</p>
							</div>
						{/if}
					{:else}
						<div class="alert alert-error">{errorMessage}</div>
					{/if}
				{:else}
					<div class="flex h-full min-h-64 items-center justify-center">
						<span class="loading loading-lg md:loading-xl loading-spinner text-primary"></span>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

{#if selectedFile}
	<dialog id="fileModal" class="modal modal-open" onclick={handleOutsideClick}>
		<div class="modal-box bg-base-100 rounded-lg p-6 shadow-xl">
			<h3 class="text-primary text-center text-lg font-bold">{selectedFile?.originalName}</h3>

			<div class="relative mt-4 flex w-full items-center justify-center">
				{#if getFileType(selectedFile.fileUrl) === 'image'}
					<img
						src={selectedFile.fileUrl}
						alt="Uploaded Image"
						class="max-h-[400px] max-w-full rounded-lg border border-gray-200 shadow-lg"
					/>
				{:else if getFileType(selectedFile.fileUrl) === 'pdf'}
					{#if isLoading}
						<div
							class="absolute inset-0 flex h-96 w-full animate-pulse items-center justify-center rounded-lg bg-gray-200"
						>
							<span class="text-gray-500">Loading PDF...</span>
						</div>
					{/if}

					<iframe
						src={selectedFile.fileUrl}
						class="h-96 w-full rounded-lg border border-gray-300 shadow-md"
						onload={() => (isLoading = false)}
					></iframe>
				{:else}
					<p class="text-center text-gray-500">📂 This file type cannot be displayed.</p>
					<div class="mt-2 flex justify-center">
						<a href={selectedFile.fileUrl} target="_blank" class="btn btn-outline btn-primary ml-3"
							>Download File</a
						>
					</div>
				{/if}
			</div>

			<div class="modal-action mt-6 flex w-full justify-between">
				{#if getFileType(selectedFile?.fileUrl) === 'image' || getFileType(selectedFile?.fileUrl) === 'pdf'}
					<a href={selectedFile.fileUrl} target="_blank" class="btn btn-outline btn-secondary">
						Open in New Tab
					</a>
				{/if}

				<div class="ml-auto">
					<button class="btn btn-error" onclick={closeModal}>Close</button>
				</div>
			</div>
		</div>
	</dialog>
{/if}
