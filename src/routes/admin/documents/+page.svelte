<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let { data, form } = $props();

	// Active tab for listing
	let listFilter = $state<'all' | 'published' | 'draft'>('all');
	let searchQuery = $state('');

	// Studio / Editor State
	let isStudioOpen = $state(false);
	let activeTab = $state<'editor' | 'preview'>('editor');
	let previewDevice = $state<'desktop' | 'mobile'>('desktop');

	// Document Form State
	let docId = $state('');
	let docTitle = $state('');
	let docSlug = $state('');
	let docCategory = $state('Governance & Policies');
	let customCategory = $state('');
	let docSummary = $state('');
	let docStatus = $state<'published' | 'draft'>('published');
	let docVisibility = $state<'public' | 'members' | 'bod' | 'admin'>('public');
	let docBannerUrl = $state('');
	let docContentHtml = $state('');

	// Visual vs Code Editor State
	let editorMode = $state<'visual' | 'code'>('visual');
	let visualEditorElement = $state<HTMLDivElement | null>(null);

	// Active Formatting States (for Caret feedback)
	let isBold = $state(false);
	let isItalic = $state(false);
	let isUnderline = $state(false);
	let isStrikeThrough = $state(false);
	let isJustifyLeft = $state(false);
	let isJustifyCenter = $state(false);
	let isJustifyRight = $state(false);
	let isJustifyFull = $state(false);
	let isBulletList = $state(false);
	let isOrderedList = $state(false);

	// Table Context State (for row/column insertion & deletion)
	let isInsideTable = $state(false);
	let activeTableCell = $state<HTMLTableCellElement | null>(null);

	// Attachments State
	interface AttachmentItem {
		id: string;
		key: string;
		fileName: string;
		fileSize: string;
		sizeBytes: number;
		url: string;
		contentType: string;
	}

	let uploadedAttachments = $state<AttachmentItem[]>([]);
	let isUploadingAttachment = $state(false);
	let attachmentUploadError = $state('');
	let attachmentFileInput = $state<HTMLInputElement | null>(null);
	let attachmentCopiedId = $state('');

	// Image Upload State (for inserting directly into HTML body)
	let isUploadingImage = $state(false);
	let imageUploadError = $state('');
	let imageFileInput = $state<HTMLInputElement | null>(null);

	// Banner Upload State
	let isUploadingBanner = $state(false);
	let bannerFileInput = $state<HTMLInputElement | null>(null);

	// Delete Modal State
	let showDeleteModal = $state(false);
	let docToDelete = $state<{ id: string; title: string } | null>(null);

	// Notification toast
	let toastMessage = $state('');

	function showToast(msg: string) {
		toastMessage = msg;
		setTimeout(() => {
			toastMessage = '';
		}, 3500);
	}

	// Watch URL or Props to auto-open editor if query param exists
	$effect(() => {
		if (data.isNew) {
			openNewDocumentStudio();
		} else if (data.activeEditDoc) {
			openEditDocumentStudio(data.activeEditDoc);
		}
	});

	// Sync visual editor innerHTML
	$effect(() => {
		if (editorMode === 'visual' && visualEditorElement) {
			if (visualEditorElement.innerHTML !== docContentHtml) {
				visualEditorElement.innerHTML = docContentHtml;
			}
		}
	});

	// Selection and Caret state listener for toolbar button feedback
	$effect(() => {
		if (typeof document === 'undefined') return;
		const handleSelection = () => {
			if (editorMode === 'visual' && isStudioOpen) {
				updateFormattingState();
			}
		};
		document.addEventListener('selectionchange', handleSelection);
		return () => {
			document.removeEventListener('selectionchange', handleSelection);
		};
	});

	function updateFormattingState() {
		if (typeof window === 'undefined' || typeof document === 'undefined') return;
		if (editorMode !== 'visual' || !visualEditorElement) return;

		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0) {
			isBold = false;
			isItalic = false;
			isUnderline = false;
			isStrikeThrough = false;
			isJustifyLeft = false;
			isJustifyCenter = false;
			isJustifyRight = false;
			isJustifyFull = false;
			isBulletList = false;
			isOrderedList = false;
			isInsideTable = false;
			activeTableCell = null;
			return;
		}

		const anchorNode = sel.anchorNode;
		if (!anchorNode || !visualEditorElement.contains(anchorNode)) {
			return;
		}

		// Detect if caret is currently inside a table cell
		const cell = findParentCell(anchorNode);
		if (cell) {
			isInsideTable = true;
			activeTableCell = cell;
		} else {
			isInsideTable = false;
			activeTableCell = null;
		}

		try {
			isBold = document.queryCommandState('bold');
			isItalic = document.queryCommandState('italic');
			isUnderline = document.queryCommandState('underline');
			isStrikeThrough = document.queryCommandState('strikeThrough');
			isJustifyLeft = document.queryCommandState('justifyLeft');
			isJustifyCenter = document.queryCommandState('justifyCenter');
			isJustifyRight = document.queryCommandState('justifyRight');
			isJustifyFull = document.queryCommandState('justifyFull');
			isBulletList = document.queryCommandState('insertUnorderedList');
			isOrderedList = document.queryCommandState('insertOrderedList');
		} catch {
			// QueryCommandState may throw in certain edge DOM contexts
		}
	}

	function findParentCell(node: Node | null): HTMLTableCellElement | null {
		let current: Node | null = node;
		while (current && current !== visualEditorElement) {
			if (current.nodeName === 'TD' || current.nodeName === 'TH') {
				return current as HTMLTableCellElement;
			}
			current = current.parentNode;
		}
		return null;
	}

	function openNewDocumentStudio() {
		docId = 'new';
		docTitle = '';
		docSlug = '';
		docCategory = 'Governance & Policies';
		customCategory = '';
		docSummary = '';
		docStatus = 'published';
		docVisibility = 'public';
		docBannerUrl = '';
		docContentHtml = `<h2>1. Overview & Purpose</h2>
<p>Write your document content here with formatting, subheadings, bullet points, and attachments.</p>

<h2>2. Key Guidelines & Provisions</h2>
<ul>
  <li>Primary objective or policy item</li>
  <li>Operational guideline or procedure</li>
</ul>`;
		uploadedAttachments = [];
		editorMode = 'visual';
		activeTab = 'editor';
		isStudioOpen = true;
	}

	function openEditDocumentStudio(document: any) {
		docId = document.id;
		docTitle = document.title;
		docSlug = document.slug;
		docCategory = document.category || 'General';
		customCategory = '';
		docSummary = document.summary || '';
		docStatus = document.status || 'published';
		docVisibility = document.visibility || 'public';
		docBannerUrl = document.banner_image_url || '';
		docContentHtml = document.content_html || '';

		try {
			if (document.attachments) {
				uploadedAttachments = JSON.parse(document.attachments);
			} else if (document.attachmentList) {
				uploadedAttachments = document.attachmentList;
			} else {
				uploadedAttachments = [];
			}
		} catch {
			uploadedAttachments = [];
		}

		editorMode = 'visual';
		activeTab = 'editor';
		isStudioOpen = true;
	}

	function closeStudio() {
		isStudioOpen = false;
		// Clear query param without full reload
		goto('/admin/documents', { noScroll: true, replaceState: true });
	}

	function generateSlugFromTitle() {
		if (!docTitle) return;
		docSlug = docTitle
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	// ----------------------------------------------------
	// WYSIWYG & Code Editor Controls
	// ----------------------------------------------------
	function handleVisualInput(e: Event) {
		const target = e.target as HTMLDivElement;
		docContentHtml = target.innerHTML;
	}

	function execVisualCommand(command: string, value: string | undefined = undefined) {
		if (typeof window === 'undefined') return;
		if (visualEditorElement) {
			visualEditorElement.focus();
		}
		document.execCommand(command, false, value);
		if (visualEditorElement) {
			docContentHtml = visualEditorElement.innerHTML;
		}
		updateFormattingState();
	}

	function formatStrikeThrough() {
		if (editorMode === 'visual') execVisualCommand('strikeThrough');
		else applyCodeFormatting('<s>', '</s>');
	}

	function formatAlignLeft() {
		if (editorMode === 'visual') execVisualCommand('justifyLeft');
		else applyCodeFormatting('<div style="text-align: left;">', '</div>');
	}

	function formatAlignCenter() {
		if (editorMode === 'visual') execVisualCommand('justifyCenter');
		else applyCodeFormatting('<div style="text-align: center;">', '</div>');
	}

	function formatAlignRight() {
		if (editorMode === 'visual') execVisualCommand('justifyRight');
		else applyCodeFormatting('<div style="text-align: right;">', '</div>');
	}

	function formatAlignJustify() {
		if (editorMode === 'visual') execVisualCommand('justifyFull');
		else applyCodeFormatting('<div style="text-align: justify;">', '</div>');
	}

	function formatIndent() {
		if (editorMode === 'visual') execVisualCommand('indent');
		else applyCodeFormatting('<div style="margin-left: 2rem;">', '</div>');
	}

	function formatOutdent() {
		if (editorMode === 'visual') execVisualCommand('outdent');
	}

	function insertHtmlAtCursor(html: string) {
		if (typeof window === 'undefined') return;
		if (!visualEditorElement) {
			docContentHtml = docContentHtml ? `${docContentHtml}${html}` : html;
			return;
		}
		visualEditorElement.focus();
		const sel = window.getSelection();
		if (!sel || sel.rangeCount === 0 || !visualEditorElement.contains(sel.anchorNode)) {
			visualEditorElement.innerHTML += html;
			docContentHtml = visualEditorElement.innerHTML;
			return;
		}
		const range = sel.getRangeAt(0);
		range.deleteContents();
		const tempEl = document.createElement('div');
		tempEl.innerHTML = html;
		const frag = document.createDocumentFragment();
		let node: ChildNode | null;
		let lastNode: ChildNode | null = null;
		while ((node = tempEl.firstChild)) {
			lastNode = frag.appendChild(node);
		}
		range.insertNode(frag);
		if (lastNode) {
			range.setStartAfter(lastNode);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);
		}
		docContentHtml = visualEditorElement.innerHTML;
	}

	function applyCodeFormatting(prefix: string, suffix = '') {
		const textarea = document.getElementById('codeEditor') as HTMLTextAreaElement | null;
		if (!textarea) {
			docContentHtml = `${docContentHtml}${prefix}${suffix}`;
			return;
		}

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selected = docContentHtml.substring(start, end);
		const before = docContentHtml.substring(0, start);
		const after = docContentHtml.substring(end);

		docContentHtml = `${before}${prefix}${selected || (suffix ? 'text' : '')}${suffix}${after}`;
		setTimeout(() => {
			textarea.focus();
			const cursor = start + prefix.length + (selected ? selected.length : (suffix ? 4 : 0));
			textarea.setSelectionRange(cursor, cursor);
		}, 0);
	}

	function formatBold() {
		if (editorMode === 'visual') execVisualCommand('bold');
		else applyCodeFormatting('<b>', '</b>');
	}

	function formatItalic() {
		if (editorMode === 'visual') execVisualCommand('italic');
		else applyCodeFormatting('<i>', '</i>');
	}

	function formatUnderline() {
		if (editorMode === 'visual') execVisualCommand('underline');
		else applyCodeFormatting('<u>', '</u>');
	}

	function formatH2() {
		if (editorMode === 'visual') execVisualCommand('formatBlock', '<h2>');
		else applyCodeFormatting('<h2>', '</h2>');
	}

	function formatH3() {
		if (editorMode === 'visual') execVisualCommand('formatBlock', '<h3>');
		else applyCodeFormatting('<h3>', '</h3>');
	}

	function formatParagraph() {
		if (editorMode === 'visual') execVisualCommand('formatBlock', '<p>');
		else applyCodeFormatting('<p>', '</p>');
	}

	function formatBulletList() {
		if (editorMode === 'visual') execVisualCommand('insertUnorderedList');
		else applyCodeFormatting('<ul>\n  <li>', '</li>\n</ul>');
	}

	function formatOrderedList() {
		if (editorMode === 'visual') execVisualCommand('insertOrderedList');
		else applyCodeFormatting('<ol>\n  <li>', '</li>\n</ol>');
	}

	function insertLink() {
		const url = prompt('Enter destination link URL:', 'https://canfacs.org');
		if (!url) return;
		if (editorMode === 'visual') {
			execVisualCommand('createLink', url);
		} else {
			applyCodeFormatting(`<a href="${url}">`, '</a>');
		}
	}

	function insertQuote() {
		if (editorMode === 'visual') {
			execVisualCommand('formatBlock', '<blockquote>');
		} else {
			applyCodeFormatting('<blockquote>', '</blockquote>');
		}
	}

	function insertTable() {
		const tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <thead>
    <tr>
      <th style="padding: 10px; border: 1px solid #334155; background: #1e293b; color: #fff;">Item / Resolution</th>
      <th style="padding: 10px; border: 1px solid #334155; background: #1e293b; color: #fff;">Status / Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #334155;">Example Provision 1</td>
      <td style="padding: 10px; border: 1px solid #334155;">Approved & Active</td>
    </tr>
  </tbody>
</table><p><br /></p>`;

		if (editorMode === 'visual') {
			insertHtmlAtCursor(tableHtml);
		} else {
			applyCodeFormatting(`\n${tableHtml}\n`);
		}
	}

	function addTableRow(position: 'above' | 'below' = 'below') {
		if (!visualEditorElement) return;
		let cell = activeTableCell;
		if (!cell) {
			const sel = window.getSelection();
			cell = findParentCell(sel?.anchorNode || null);
		}
		if (!cell) {
			insertTable();
			return;
		}

		const currentRow = cell.closest('tr');
		if (!currentRow) return;

		const colsCount = currentRow.children.length;
		const newRow = document.createElement('tr');

		for (let i = 0; i < colsCount; i++) {
			const newCell = document.createElement('td');
			newCell.style.padding = '10px';
			newCell.style.border = '1px solid #334155';
			newCell.innerHTML = '<br />';
			newRow.appendChild(newCell);
		}

		if (position === 'above') {
			currentRow.before(newRow);
		} else {
			currentRow.after(newRow);
		}

		docContentHtml = visualEditorElement.innerHTML;

		// Move caret to first cell of new row
		const firstCell = newRow.children[0] as HTMLTableCellElement;
		if (firstCell && typeof window !== 'undefined') {
			const range = document.createRange();
			range.selectNodeContents(firstCell);
			range.collapse(true);
			const sel = window.getSelection();
			sel?.removeAllRanges();
			sel?.addRange(range);
			activeTableCell = firstCell;
			isInsideTable = true;
		}
		updateFormattingState();
	}

	function addTableColumn(position: 'left' | 'right' = 'right') {
		if (!visualEditorElement) return;
		let cell = activeTableCell;
		if (!cell) {
			const sel = window.getSelection();
			cell = findParentCell(sel?.anchorNode || null);
		}
		if (!cell) return;

		const currentRow = cell.closest('tr');
		const table = cell.closest('table');
		if (!currentRow || !table) return;

		const colIndex = Array.from(currentRow.children).indexOf(cell);
		if (colIndex === -1) return;

		const allRows = table.querySelectorAll('tr');
		allRows.forEach((row) => {
			const targetCell = row.children[colIndex];
			const isHeader = targetCell && targetCell.nodeName === 'TH';
			const newCell = document.createElement(isHeader ? 'th' : 'td');
			newCell.style.padding = '10px';
			newCell.style.border = '1px solid #334155';
			if (isHeader) {
				newCell.style.background = '#1e293b';
				newCell.style.color = '#fff';
				newCell.textContent = 'Header';
			} else {
				newCell.innerHTML = '<br />';
			}

			if (targetCell) {
				if (position === 'left') {
					targetCell.before(newCell);
				} else {
					targetCell.after(newCell);
				}
			} else {
				row.appendChild(newCell);
			}
		});

		docContentHtml = visualEditorElement.innerHTML;
		updateFormattingState();
	}

	function deleteTableRow() {
		if (!visualEditorElement) return;
		let cell = activeTableCell;
		if (!cell) {
			const sel = window.getSelection();
			cell = findParentCell(sel?.anchorNode || null);
		}
		if (!cell) return;

		const row = cell.closest('tr');
		const table = cell.closest('table');
		if (!row || !table) return;

		const allRows = table.querySelectorAll('tr');
		if (allRows.length <= 1) {
			table.remove();
			activeTableCell = null;
			isInsideTable = false;
		} else {
			row.remove();
		}

		docContentHtml = visualEditorElement.innerHTML;
		updateFormattingState();
	}

	function deleteTableColumn() {
		if (!visualEditorElement) return;
		let cell = activeTableCell;
		if (!cell) {
			const sel = window.getSelection();
			cell = findParentCell(sel?.anchorNode || null);
		}
		if (!cell) return;

		const currentRow = cell.closest('tr');
		const table = cell.closest('table');
		if (!currentRow || !table) return;

		const colIndex = Array.from(currentRow.children).indexOf(cell);
		if (colIndex === -1) return;

		const allRows = table.querySelectorAll('tr');
		const colCount = currentRow.children.length;

		if (colCount <= 1) {
			table.remove();
			activeTableCell = null;
			isInsideTable = false;
		} else {
			allRows.forEach((row) => {
				if (row.children[colIndex]) {
					row.children[colIndex].remove();
				}
			});
		}

		docContentHtml = visualEditorElement.innerHTML;
		updateFormattingState();
	}

	function deleteEntireTable() {
		if (!visualEditorElement) return;
		let cell = activeTableCell;
		if (!cell) {
			const sel = window.getSelection();
			cell = findParentCell(sel?.anchorNode || null);
		}
		if (!cell) return;

		const table = cell.closest('table');
		if (table) {
			table.remove();
			activeTableCell = null;
			isInsideTable = false;
			docContentHtml = visualEditorElement.innerHTML;
			updateFormattingState();
		}
	}

	function handleEditorKeyDown(e: KeyboardEvent) {
		if (e.key === 'Tab') {
			const sel = window.getSelection();
			const cell = findParentCell(sel?.anchorNode || null);
			if (cell) {
				const row = cell.closest('tr');
				const table = cell.closest('table');
				if (row && table) {
					const isLastCellInRow = cell === row.children[row.children.length - 1];
					const allRows = table.querySelectorAll('tr');
					const isLastRowInTable = row === allRows[allRows.length - 1];

					if (isLastCellInRow && isLastRowInTable && !e.shiftKey) {
						// Pressing Tab in the last cell of the table creates a new row below
						e.preventDefault();
						addTableRow('below');
						return;
					}
				}
			}
		}
	}

	function insertDivider() {
		const hrHtml = `<hr style="border: 0; border-top: 1px solid #334155; margin: 24px 0;" /><p><br /></p>`;
		if (editorMode === 'visual') {
			insertHtmlAtCursor(hrHtml);
		} else {
			applyCodeFormatting(`\n${hrHtml}\n`);
		}
	}

	// ----------------------------------------------------
	// R2 Image Upload Handler (Inline in Document)
	// ----------------------------------------------------
	async function handleInlineImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		isUploadingImage = true;
		imageUploadError = '';

		try {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const formData = new FormData();
				formData.append('file', file);

				const res = await fetch('/api/upload', {
					method: 'POST',
					body: formData
				});

				const result = (await res.json()) as any;
				if (!res.ok || result.error) {
					throw new Error(result.error || 'Failed to upload image.');
				}

				const imgUrl = result.url;
				const altText = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
				const imgHtml = `<figure style="margin: 24px 0; text-align: center;"><img src="${imgUrl}" alt="${altText}" style="max-width: 100%; height: auto; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5);" /><figcaption style="font-size: 12px; color: #94a3b8; margin-top: 8px;">${altText}</figcaption></figure><p><br /></p>`;

				if (editorMode === 'visual') {
					insertHtmlAtCursor(imgHtml);
				} else {
					applyCodeFormatting(`\n${imgHtml}\n`);
				}
			}
			showToast('Image uploaded and inserted successfully!');
		} catch (err: any) {
			imageUploadError = err?.message || 'Error uploading picture.';
		} finally {
			isUploadingImage = false;
			if (input) input.value = '';
		}
	}

	// ----------------------------------------------------
	// R2 Banner Upload Handler
	// ----------------------------------------------------
	async function handleBannerUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		isUploadingBanner = true;
		try {
			const file = files[0];
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const result = (await res.json()) as any;
			if (!res.ok || result.error) {
				throw new Error(result.error || 'Banner upload failed.');
			}
			docBannerUrl = result.url;
			showToast('Banner image updated!');
		} catch (err: any) {
			alert(err?.message || 'Failed to upload banner.');
		} finally {
			isUploadingBanner = false;
			if (input) input.value = '';
		}
	}

	// ----------------------------------------------------
	// R2 Document Attachment Upload Handler
	// ----------------------------------------------------
	async function handleAttachmentUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		isUploadingAttachment = true;
		attachmentUploadError = '';

		try {
			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const formData = new FormData();
				formData.append('file', file);

				const res = await fetch('/api/attachments/upload', {
					method: 'POST',
					body: formData
				});

				const result = (await res.json()) as any;
				if (!res.ok || !result.success) {
					throw new Error(result.error || 'Failed to upload attachment.');
				}

				const newItem: AttachmentItem = {
					id: `att_${crypto.randomUUID().slice(0, 8)}`,
					key: result.key,
					fileName: result.fileName,
					fileSize: result.fileSize,
					sizeBytes: result.sizeBytes,
					url: result.url,
					contentType: result.contentType
				};

				uploadedAttachments = [...uploadedAttachments, newItem];
				insertAttachmentCard(newItem);
			}
			showToast('Attachment uploaded and card inserted!');
		} catch (err: any) {
			attachmentUploadError = err?.message || 'Error uploading attachment.';
		} finally {
			isUploadingAttachment = false;
			if (input) input.value = '';
		}
	}

	function insertAttachmentCard(att: AttachmentItem) {
		const icon = getFileIcon(att.fileName);
		const cardHtml = `<div style="margin: 24px 0; max-width: 580px;"><table cellpadding="0" cellspacing="0" border="0" style="width: 100%; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><tr><td style="padding: 16px 20px;"><table cellpadding="0" cellspacing="0" border="0" style="width: 100%;"><tr><td style="width: 44px; vertical-align: middle;"><div style="width: 40px; height: 40px; background-color: #0f172a; border: 1px solid #475569; border-radius: 10px; text-align: center; line-height: 40px; font-size: 20px;">${icon}</div></td><td style="padding-left: 14px; vertical-align: middle;"><div style="font-size: 14px; font-weight: bold; color: #ffffff; line-height: 1.3;">${att.fileName}</div><div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Official Document • ${att.fileSize}</div></td><td style="text-align: right; vertical-align: middle; width: 140px;"><a href="${att.url}" target="_blank" download="${att.fileName}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: bold;">Download &darr;</a></td></tr></table></td></tr></table></div><p><br /></p>`;

		if (editorMode === 'visual') {
			insertHtmlAtCursor(cardHtml);
		} else {
			applyCodeFormatting(`\n${cardHtml}\n`);
		}
	}

	function removeAttachment(id: string) {
		uploadedAttachments = uploadedAttachments.filter((a) => a.id !== id);
	}

	function copyAttachmentUrl(att: AttachmentItem) {
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(att.url);
			attachmentCopiedId = att.id;
			setTimeout(() => {
				attachmentCopiedId = '';
			}, 2000);
		}
	}

	function getFileIcon(filename: string) {
		const ext = filename.split('.').pop()?.toLowerCase() || '';
		if (['pdf'].includes(ext)) return '📄';
		if (['doc', 'docx'].includes(ext)) return '📝';
		if (['xls', 'xlsx', 'csv'].includes(ext)) return '📊';
		if (['ppt', 'pptx'].includes(ext)) return '📑';
		if (['zip', 'rar'].includes(ext)) return '📦';
		if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return '🖼️';
		return '📎';
	}

	// Filtered Documents
	const filteredDocs = $derived(
		data.documents.filter((d: any) => {
			const matchesFilter = listFilter === 'all' || d.status === listFilter;
			const q = searchQuery.toLowerCase().trim();
			const matchesQuery =
				!q ||
				d.title.toLowerCase().includes(q) ||
				(d.summary && d.summary.toLowerCase().includes(q)) ||
				(d.category && d.category.toLowerCase().includes(q));
			return matchesFilter && matchesQuery;
		})
	);

	const effectiveCategory = $derived(
		docCategory === '__custom__' && customCategory.trim() ? customCategory.trim() : docCategory
	);
</script>

<svelte:head>
	<title>Document Publishing CMS - CANFACS Admin</title>
</svelte:head>

<section class="py-10 bg-slate-950 min-h-screen text-slate-100">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
		<!-- Notification Toast -->
		{#if toastMessage}
			<div class="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
				<span>✓</span>
				<span>{toastMessage}</span>
			</div>
		{/if}

		<!-- CMS Header & Management Bar -->
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
			<div>
				<div class="flex items-center gap-2.5">
					<span class="px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/50 text-[10px] font-bold uppercase tracking-wider">
						Executive Admin CMS
					</span>
					<span class="text-xs text-slate-400">Cloudflare D1 &amp; R2 Storage</span>
				</div>
				<h1 class="text-2xl sm:text-3xl font-extrabold text-white mt-1">
					Documents &amp; Publications CMS
				</h1>
				<p class="text-xs sm:text-sm text-slate-400 mt-1">
					Author, format, attach official files (PDF/Word), and publish pages to the public website.
				</p>
			</div>

			<div class="flex items-center gap-3">
				<a
					href="/documents"
					target="_blank"
					class="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
				>
					<span>🌐</span>
					<span>View Public Portal</span>
				</a>

				<button
					type="button"
					onclick={openNewDocumentStudio}
					class="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-red-600/30 flex items-center gap-1.5 transform hover:-translate-y-0.5"
				>
					<span>➕</span>
					<span>Create New Document</span>
				</button>
			</div>
		</div>

		<!-- Dashboard Stats Cards -->
		<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
			<div class="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
				<div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Documents</div>
				<div class="text-2xl sm:text-3xl font-extrabold text-white mt-2">
					{data.stats.totalCount}
				</div>
				<div class="text-[10px] text-slate-400 mt-1">Across all categories</div>
			</div>

			<div class="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
				<div class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Published Live</div>
				<div class="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
					{data.stats.publishedCount}
				</div>
				<div class="text-[10px] text-slate-400 mt-1">Publicly accessible on web</div>
			</div>

			<div class="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
				<div class="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Drafts</div>
				<div class="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2">
					{data.stats.draftCount}
				</div>
				<div class="text-[10px] text-slate-400 mt-1">Only admins can preview</div>
			</div>

			<div class="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-md">
				<div class="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">R2 Attachments</div>
				<div class="text-2xl sm:text-3xl font-extrabold text-cyan-400 mt-2">
					{data.stats.totalAttachments}
				</div>
				<div class="text-[10px] text-slate-400 mt-1">PDF, Word, Excel files</div>
			</div>
		</div>

		<!-- Filter Tabs & Search Bar -->
		<div class="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
			<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<!-- Status Filters -->
				<div class="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs self-start">
					<button
						type="button"
						onclick={() => (listFilter = 'all')}
						class="px-3.5 py-1.5 rounded-xl transition-all font-semibold {listFilter === 'all'
							? 'bg-red-600 text-white shadow font-bold'
							: 'text-slate-400 hover:text-white'}"
					>
						All ({data.documents.length})
					</button>
					<button
						type="button"
						onclick={() => (listFilter = 'published')}
						class="px-3.5 py-1.5 rounded-xl transition-all font-semibold {listFilter === 'published'
							? 'bg-emerald-600 text-white shadow font-bold'
							: 'text-slate-400 hover:text-white'}"
					>
						Published ({data.stats.publishedCount})
					</button>
					<button
						type="button"
						onclick={() => (listFilter = 'draft')}
						class="px-3.5 py-1.5 rounded-xl transition-all font-semibold {listFilter === 'draft'
							? 'bg-amber-600 text-white shadow font-bold'
							: 'text-slate-400 hover:text-white'}"
					>
						Drafts ({data.stats.draftCount})
					</button>
				</div>

				<!-- Search Input -->
				<div class="relative w-full sm:w-72">
					<span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
						🔍
					</span>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search documents..."
						class="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
					/>
					{#if searchQuery}
						<button
							type="button"
							onclick={() => (searchQuery = '')}
							class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs"
						>
							✕
						</button>
					{/if}
				</div>
			</div>
		</div>

		<!-- Documents Table / Cards -->
		{#if filteredDocs.length > 0}
			<div class="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl">
				<table class="w-full text-left text-xs">
					<thead class="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
						<tr>
							<th class="py-4 px-6 font-bold">Document Title &amp; Slug</th>
							<th class="py-4 px-4 font-bold">Category</th>
							<th class="py-4 px-4 font-bold">Access Level</th>
							<th class="py-4 px-4 font-bold">Status</th>
							<th class="py-4 px-4 font-bold">Attachments</th>
							<th class="py-4 px-4 font-bold">Published Date</th>
							<th class="py-4 px-6 text-right font-bold">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-slate-800/60">
						{#each filteredDocs as doc (doc.id)}
							<tr class="hover:bg-slate-800/40 transition-colors group">
								<!-- Title & Slug -->
								<td class="py-4 px-6">
									<div class="font-bold text-white text-sm group-hover:text-red-400 transition-colors">
										{doc.title}
									</div>
									<div class="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
										<span>/documents/{doc.slug}</span>
										<a
											href={`/documents/${doc.slug}`}
											target="_blank"
											class="text-red-400 hover:underline text-[10px]"
											title="Open page"
										>
											↗
										</a>
									</div>
								</td>

								<!-- Category -->
								<td class="py-4 px-4">
									<span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[11px]">
										{doc.category || 'General'}
									</span>
								</td>

								<!-- Access Level / Role Visibility -->
								<td class="py-4 px-4">
									{#if doc.visibility === 'members'}
										<span class="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 font-bold text-[10px] inline-flex items-center gap-1" title="Restricted to logged-in Society Members (e.g. AGM)">
											<span>🍁</span>
											<span>Members</span>
										</span>
									{:else if doc.visibility === 'bod'}
										<span class="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 font-bold text-[10px] inline-flex items-center gap-1" title="Restricted to Board of Directors & Admins (e.g. BOD Notes)">
											<span>🛡️</span>
											<span>BOD Only</span>
										</span>
									{:else if doc.visibility === 'admin'}
										<span class="px-2.5 py-1 rounded-full bg-red-950 text-red-300 border border-red-800/60 font-bold text-[10px] inline-flex items-center gap-1" title="Restricted strictly to system administrators">
											<span>🔒</span>
											<span>Admin Only</span>
										</span>
									{:else}
										<span class="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-[10px] inline-flex items-center gap-1" title="Publicly accessible to all visitors">
											<span>🌐</span>
											<span>Public</span>
										</span>
									{/if}
								</td>

								<!-- Status Toggle Form -->
								<td class="py-4 px-4">
									<form
										method="POST"
										action="?/toggleStatus"
										use:enhance={() => {
											return async ({ update }) => {
												await update();
												showToast('Status updated successfully');
											};
										}}
									>
										<input type="hidden" name="id" value={doc.id} />
										<input type="hidden" name="currentStatus" value={doc.status} />
										<button
											type="submit"
											class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer {doc.status === 'published'
												? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900'
												: 'bg-amber-950 text-amber-300 border border-amber-800/60 hover:bg-amber-900'}"
											title="Click to toggle status"
										>
											<span class="w-1.5 h-1.5 rounded-full {doc.status === 'published' ? 'bg-emerald-400' : 'bg-amber-400'}"></span>
											<span>{doc.status}</span>
										</button>
									</form>
								</td>

								<!-- Attachments Badge -->
								<td class="py-4 px-4">
									{#if doc.attachmentList && doc.attachmentList.length > 0}
										<span class="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/50 font-bold text-[11px] inline-flex items-center gap-1">
											<span>📎</span>
											<span>{doc.attachmentList.length} files</span>
										</span>
									{:else}
										<span class="text-slate-400 text-[11px]">None</span>
									{/if}
								</td>

								<!-- Date -->
								<td class="py-4 px-4 text-slate-400 text-[11px]">
									{new Date(doc.published_at || doc.created_at).toLocaleDateString('en-CA')}
								</td>

								<!-- Action Buttons -->
								<td class="py-4 px-6 text-right">
									<div class="flex items-center justify-end gap-2">
										<button
											type="button"
											onclick={() => openEditDocumentStudio(doc)}
											class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition-all text-xs flex items-center gap-1"
										>
											<span>✏️</span>
											<span>Edit</span>
										</button>

										<a
											href={`/documents/${doc.slug}`}
											target="_blank"
											class="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs"
											title="View Public Page"
										>
											🌐
										</a>

										<button
											type="button"
											onclick={() => {
												docToDelete = { id: doc.id, title: doc.title };
												showDeleteModal = true;
											}}
											class="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/40 text-red-300 transition-all text-xs"
											title="Delete Document"
										>
											🗑️
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
				<div class="text-3xl">📂</div>
				<h3 class="text-base font-bold text-white">No documents found</h3>
				<p class="text-xs text-slate-400">Click below to draft your first public document.</p>
				<button
					type="button"
					onclick={openNewDocumentStudio}
					class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all"
				>
					+ Create New Document
				</button>
			</div>
		{/if}
	</div>
</section>

<!-- ========================================================= -->
<!-- CMS DOCUMENT STUDIO (FULL-SCREEN MODAL / STUDIO EDITOR)   -->
<!-- ========================================================= -->
{#if isStudioOpen}
	<div class="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
		<!-- Studio Header Bar -->
		<div class="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
			<div class="flex items-center gap-3">
				<button
					type="button"
					onclick={closeStudio}
					class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
					title="Close Studio"
				>
					✕
				</button>
				<div>
					<div class="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
						<span>🏛️</span>
						<span>{docId === 'new' ? 'New Document Studio' : 'Edit Document Studio'}</span>
					</div>
					<h2 class="text-sm sm:text-base font-bold text-white truncate max-w-md">
						{docTitle || 'Untitled Document Page'}
					</h2>
				</div>
			</div>

			<!-- Tabs: Editor vs Live Preview -->
			<div class="flex items-center gap-2">
				<div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
					<button
						type="button"
						onclick={() => (activeTab = 'editor')}
						class="px-3 py-1 rounded-lg transition-all font-semibold {activeTab === 'editor'
							? 'bg-red-600 text-white font-bold shadow'
							: 'text-slate-400 hover:text-white'}"
					>
						✍️ Editor
					</button>
					<button
						type="button"
						onclick={() => (activeTab = 'preview')}
						class="px-3 py-1 rounded-lg transition-all font-semibold {activeTab === 'preview'
							? 'bg-slate-800 text-cyan-300 border border-slate-700 font-bold shadow'
							: 'text-slate-400 hover:text-white'}"
					>
						👁️ Live Preview
					</button>
				</div>

				<button
					type="button"
					onclick={() => {
						const formEl = document.getElementById('documentCmsForm') as HTMLFormElement | null;
						if (formEl) formEl.requestSubmit();
					}}
					class="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-red-600/30 flex items-center gap-1.5"
				>
					<span>💾</span>
					<span>{docStatus === 'published' ? 'Publish to Website' : 'Save as Draft'}</span>
				</button>
			</div>
		</div>

		<!-- Hidden file inputs for R2 Uploads -->
		<input
			bind:this={imageFileInput}
			type="file"
			accept="image/*"
			class="hidden"
			onchange={handleInlineImageUpload}
		/>
		<input
			bind:this={attachmentFileInput}
			type="file"
			accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
			class="hidden"
			multiple
			onchange={handleAttachmentUpload}
		/>
		<input
			bind:this={bannerFileInput}
			type="file"
			accept="image/*"
			class="hidden"
			onchange={handleBannerUpload}
		/>

		<!-- Studio Body -->
		<div class="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-grow">
			{#if activeTab === 'editor'}
				<form
					id="documentCmsForm"
					method="POST"
					action="?/save"
					use:enhance={() => {
						return async ({ result, update }) => {
							if (result.type === 'success') {
								showToast('Document saved successfully!');
								await update();
								isStudioOpen = false;
							} else if (result.type === 'failure') {
								alert(result.data?.error || 'Failed to save document.');
							}
						};
					}}
					class="space-y-8"
				>
					<input type="hidden" name="id" value={docId} />
					<input type="hidden" name="content_html" value={docContentHtml} />
					<input type="hidden" name="attachments" value={JSON.stringify(uploadedAttachments)} />

					<!-- Main Meta Grid -->
					<div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
						<div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
							<!-- Document Title -->
							<div class="lg:col-span-2 space-y-2">
								<label for="docTitle" class="block text-xs font-bold text-slate-300 uppercase tracking-wider">
									Document Title <span class="text-red-500">*</span>
								</label>
								<input
									id="docTitle"
									name="title"
									type="text"
									required
									bind:value={docTitle}
									onblur={() => {
										if (!docSlug) generateSlugFromTitle();
									}}
									placeholder="e.g. CANFACS Constitution & Bylaws 2026"
									class="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-base focus:outline-none focus:border-red-500 shadow-inner"
								/>
							</div>

							<!-- Access Level & Role Visibility -->
							<div class="space-y-2">
								<label for="docVisibility" class="block text-xs font-bold text-slate-300 uppercase tracking-wider">
									Access Level <span class="text-red-500">*</span>
								</label>
								<select
									id="docVisibility"
									name="visibility"
									bind:value={docVisibility}
									class="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-red-500 shadow-inner"
								>
									<option value="public">🌐 Public (All Visitors)</option>
									<option value="members">🍁 Members Only (e.g. AGM Notes)</option>
									<option value="bod">🛡️ BOD Only (e.g. BOD Minutes)</option>
									<option value="admin">🔒 Admin Only (Confidential)</option>
								</select>
							</div>

							<!-- Publication Status -->
							<div class="space-y-2">
								<label for="docStatus" class="block text-xs font-bold text-slate-300 uppercase tracking-wider">
									Publication Status
								</label>
								<select
									id="docStatus"
									name="status"
									bind:value={docStatus}
									class="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold text-sm focus:outline-none focus:border-red-500 shadow-inner"
								>
									<option value="published">🟢 Published (Live)</option>
									<option value="draft">🟡 Draft (Admin Only)</option>
								</select>
							</div>
						</div>

						<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
							<!-- Slug URL -->
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<label for="docSlug" class="block text-xs font-bold text-slate-300 uppercase tracking-wider">
										URL Slug <span class="text-slate-400 font-normal">(/documents/...)</span>
									</label>
									<button
										type="button"
										onclick={generateSlugFromTitle}
										class="text-[11px] text-red-400 hover:text-red-300 font-semibold"
									>
										Auto-generate
									</button>
								</div>
								<div class="flex items-center rounded-2xl bg-slate-900 border border-slate-800 px-3 py-2 shadow-inner focus-within:border-red-500">
									<span class="text-xs text-slate-400 font-mono select-none">/documents/</span>
									<input
										id="docSlug"
										name="slug"
										type="text"
										required
										bind:value={docSlug}
										placeholder="constitution-and-bylaws"
										class="w-full bg-transparent text-xs text-cyan-300 font-mono focus:outline-none pl-1"
									/>
								</div>
							</div>

							<!-- Category -->
							<div class="space-y-2">
								<label for="docCategory" class="block text-xs font-bold text-slate-300 uppercase tracking-wider">
									Category
								</label>
								<div class="flex gap-2">
									<select
										id="docCategory"
										name="category"
										bind:value={docCategory}
										class="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500 shadow-inner"
									>
										<option value="Governance & Policies">Governance &amp; Policies</option>
										<option value="Financials & Audits">Financials &amp; Audits</option>
										<option value="Meeting Minutes">Meeting Minutes</option>
										<option value="Publications & Articles">Publications &amp; Articles</option>
										<option value="Press Releases">Press Releases</option>
										<option value="Forms & Applications">Forms &amp; Applications</option>
										<option value="General">General</option>
										<option value="__custom__">+ Enter Custom Category</option>
									</select>
									{#if docCategory === '__custom__'}
										<input
											type="text"
											bind:value={customCategory}
											placeholder="Custom category name..."
											class="w-full px-3 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500 shadow-inner"
										/>
									{/if}
								</div>
							</div>
						</div>

						<!-- Summary / Excerpt -->
						<div class="space-y-2">
							<label for="docSummary" class="block text-xs font-bold text-slate-300 uppercase tracking-wider">
								Short Summary / Abstract <span class="text-slate-400 font-normal">(Used for cards, previews &amp; SEO)</span>
							</label>
							<textarea
								id="docSummary"
								name="summary"
								rows="2"
								bind:value={docSummary}
								placeholder="Briefly describe the purpose of this document..."
								class="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-inner leading-relaxed"
							></textarea>
						</div>

						<!-- Featured Banner Image Upload -->
						<div class="space-y-2 pt-2 border-t border-slate-800/80">
							<div class="flex items-center justify-between">
								<label for="docBannerUrl" class="block text-xs font-bold text-slate-300 uppercase tracking-wider">
									Featured Banner Image <span class="text-slate-400 font-normal">(Optional header hero)</span>
								</label>
								<button
									type="button"
									onclick={() => bannerFileInput?.click()}
									disabled={isUploadingBanner}
									class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
								>
									<span>📷</span>
									<span>{isUploadingBanner ? 'Uploading...' : 'Upload Image to R2'}</span>
								</button>
							</div>
							<div class="flex items-center gap-3">
								<input
									id="docBannerUrl"
									name="banner_image_url"
									type="text"
									bind:value={docBannerUrl}
									placeholder="Image URL or upload via button above..."
									class="w-full px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500 shadow-inner"
								/>
								{#if docBannerUrl}
									<button
										type="button"
										onclick={() => (docBannerUrl = '')}
										class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 text-xs shrink-0"
										title="Remove banner"
									>
										✕
									</button>
								{/if}
							</div>
							{#if docBannerUrl}
								<div class="mt-2 rounded-xl overflow-hidden border border-slate-800 max-h-32 w-full">
									<img src={docBannerUrl} alt="Banner preview" class="w-full h-32 object-cover" />
								</div>
							{/if}
						</div>
					</div>

					<!-- Rich Text & Code Editor Container -->
					<div class="bg-slate-900/70 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-2xl backdrop-blur-sm">
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
							<div class="flex items-center gap-2">
								<span class="text-sm font-bold text-white flex items-center gap-1.5">
									<span>✍️</span>
									<span>Document Content Body</span>
								</span>
								{#if editorMode === 'visual'}
									<span class="text-[10px] px-2.5 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/50 font-semibold">
										Visual WYSIWYG
									</span>
								{:else}
									<span class="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
										&lt;/&gt; HTML Code
									</span>
								{/if}
							</div>

							<!-- Mode Switcher -->
							<div class="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
								<button
									type="button"
									onclick={() => {
										editorMode = 'visual';
										if (visualEditorElement) visualEditorElement.innerHTML = docContentHtml;
									}}
									class="px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 {editorMode === 'visual'
										? 'bg-red-600 text-white font-bold shadow'
										: 'text-slate-400 hover:text-white'}"
								>
									<span>👁️</span>
									<span>Visual Editor</span>
								</button>
								<button
									type="button"
									onclick={() => {
										if (visualEditorElement) docContentHtml = visualEditorElement.innerHTML;
										editorMode = 'code';
									}}
									class="px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 {editorMode === 'code'
										? 'bg-slate-800 text-cyan-300 border border-slate-700 font-bold shadow'
										: 'text-slate-400 hover:text-white'}"
								>
									<span>&lt;/&gt;</span>
									<span>HTML Code</span>
								</button>
							</div>
						</div>

						<!-- Floating Sticky Formatting Toolbar (remains docked when scrolling long documents) -->
						<div class="sticky top-[58px] sm:top-[61px] z-30 flex items-center gap-1.5 p-2 bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl shadow-black/80 flex-wrap text-xs transition-all">
							<!-- Font Style Toggles with Active Caret State -->
							<button
								type="button"
								onclick={formatBold}
								class="px-2.5 py-1 rounded-lg border text-xs font-bold transition-all {isBold
									? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Bold (Ctrl+B)"
							>
								B
							</button>
							<button
								type="button"
								onclick={formatItalic}
								class="px-2.5 py-1 rounded-lg border text-xs italic font-serif transition-all {isItalic
									? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Italic (Ctrl+I)"
							>
								I
							</button>
							<button
								type="button"
								onclick={formatUnderline}
								class="px-2.5 py-1 rounded-lg border text-xs underline transition-all {isUnderline
									? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Underline (Ctrl+U)"
							>
								U
							</button>
							<button
								type="button"
								onclick={formatStrikeThrough}
								class="px-2.5 py-1 rounded-lg border text-xs line-through transition-all {isStrikeThrough
									? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Strikethrough"
							>
								S
							</button>

							<div class="h-4 w-px bg-slate-800 mx-1"></div>

							<!-- Text Alignment & Justification -->
							<button
								type="button"
								onclick={formatAlignLeft}
								class="p-1.5 rounded-lg border text-xs transition-all {isJustifyLeft
									? 'bg-red-600 text-white border-red-500 shadow-md'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Align Left"
							>
								<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
							</button>
							<button
								type="button"
								onclick={formatAlignCenter}
								class="p-1.5 rounded-lg border text-xs transition-all {isJustifyCenter
									? 'bg-red-600 text-white border-red-500 shadow-md'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Align Center"
							>
								<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
							</button>
							<button
								type="button"
								onclick={formatAlignRight}
								class="p-1.5 rounded-lg border text-xs transition-all {isJustifyRight
									? 'bg-red-600 text-white border-red-500 shadow-md'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Align Right"
							>
								<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
							</button>
							<button
								type="button"
								onclick={formatAlignJustify}
								class="p-1.5 rounded-lg border text-xs transition-all {isJustifyFull
									? 'bg-red-600 text-white border-red-500 shadow-md'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Justify Full (Even Margins)"
							>
								<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>
							</button>

							<div class="h-4 w-px bg-slate-800 mx-1"></div>

							<!-- Line / Paragraph Indentation -->
							<button
								type="button"
								onclick={formatOutdent}
								class="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
								title="Decrease Indent / Outdent"
							>
								<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="18" x2="11" y2="18"/><polyline points="7 8 3 12 7 16"/></svg>
							</button>
							<button
								type="button"
								onclick={formatIndent}
								class="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
								title="Increase Indent"
							>
								<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="18" x2="11" y2="18"/><polyline points="3 8 7 12 3 16"/></svg>
							</button>

							<div class="h-4 w-px bg-slate-800 mx-1"></div>

							<!-- Headings & Paragraph -->
							<button
								type="button"
								onclick={formatH2}
								class="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold border border-slate-800 transition-colors"
								title="H2 Major Section"
							>
								H2
							</button>
							<button
								type="button"
								onclick={formatH3}
								class="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold border border-slate-800 transition-colors"
								title="H3 Sub-section"
							>
								H3
							</button>
							<button
								type="button"
								onclick={formatParagraph}
								class="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors text-[11px]"
								title="Paragraph"
							>
								¶ Para
							</button>

							<div class="h-4 w-px bg-slate-800 mx-1"></div>

							<!-- Lists & Inserts -->
							<button
								type="button"
								onclick={formatBulletList}
								class="px-2 py-1 rounded-lg border text-xs transition-all {isBulletList
									? 'bg-red-600 text-white border-red-500 shadow-md'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Bullet list"
							>
								• List
							</button>
							<button
								type="button"
								onclick={formatOrderedList}
								class="px-2 py-1 rounded-lg border text-xs transition-all {isOrderedList
									? 'bg-red-600 text-white border-red-500 shadow-md'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Numbered list"
							>
								1. List
							</button>
							<button
								type="button"
								onclick={insertQuote}
								class="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
								title="Blockquote"
							>
								“ Quote
							</button>
							<button
								type="button"
								onclick={insertTable}
								class="px-2.5 py-1 rounded-lg border text-xs transition-all {isInsideTable
									? 'bg-cyan-900 text-cyan-200 border-cyan-700 shadow-md'
									: 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'}"
								title="Insert 2x2 Table"
							>
								📊 Table
							</button>

							<!-- Contextual Table Operations Strip (appears whenever caret is inside a table) -->
							{#if isInsideTable}
								<div class="flex items-center gap-1 px-2.5 py-0.5 bg-cyan-950/90 border border-cyan-700/70 rounded-xl text-cyan-200 text-xs shadow-md">
									<span class="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mr-1">Table:</span>
									<button
										type="button"
										onclick={() => addTableRow('above')}
										class="px-2 py-0.5 rounded-md bg-cyan-900/70 hover:bg-cyan-800 text-cyan-100 hover:text-white font-medium text-[11px] transition-colors"
										title="Insert Row Above"
									>
										+ Row Above
									</button>
									<button
										type="button"
										onclick={() => addTableRow('below')}
										class="px-2 py-0.5 rounded-md bg-cyan-900/70 hover:bg-cyan-800 text-cyan-100 hover:text-white font-bold text-[11px] transition-colors flex items-center gap-1"
										title="Insert Row Below (or press Tab in last cell)"
									>
										<span>+ Row Below</span>
										<span class="text-[9px] px-1 rounded bg-cyan-800/80 text-cyan-200 font-mono">Tab</span>
									</button>
									<div class="h-3 w-px bg-cyan-800 mx-0.5"></div>
									<button
										type="button"
										onclick={() => addTableColumn('left')}
										class="px-2 py-0.5 rounded-md bg-cyan-900/70 hover:bg-cyan-800 text-cyan-100 hover:text-white font-medium text-[11px] transition-colors"
										title="Insert Column to Left"
									>
										+ Col Left
									</button>
									<button
										type="button"
										onclick={() => addTableColumn('right')}
										class="px-2 py-0.5 rounded-md bg-cyan-900/70 hover:bg-cyan-800 text-cyan-100 hover:text-white font-medium text-[11px] transition-colors"
										title="Insert Column to Right"
									>
										+ Col Right
									</button>
									<div class="h-3 w-px bg-cyan-800 mx-0.5"></div>
									<button
										type="button"
										onclick={deleteTableRow}
										class="px-2 py-0.5 rounded-md bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white font-medium text-[11px] transition-colors"
										title="Delete Current Row"
									>
										- Row
									</button>
									<button
										type="button"
										onclick={deleteTableColumn}
										class="px-2 py-0.5 rounded-md bg-rose-950/70 hover:bg-rose-900 text-rose-300 hover:text-white font-medium text-[11px] transition-colors"
										title="Delete Current Column"
									>
										- Col
									</button>
									<button
										type="button"
										onclick={deleteEntireTable}
										class="p-1 rounded-md bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white transition-colors"
										title="Delete Entire Table"
									>
										🗑️
									</button>
								</div>
							{/if}

							<button
								type="button"
								onclick={insertLink}
								class="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors"
								title="Insert Hyperlink"
							>
								🔗 Link
							</button>
							<button
								type="button"
								onclick={insertDivider}
								class="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 text-[11px]"
								title="Horizontal Divider"
							>
								— Rule
							</button>

							<div class="h-4 w-px bg-slate-800 mx-1"></div>

							<!-- R2 Media Upload Actions -->
							<button
								type="button"
								onclick={() => imageFileInput?.click()}
								disabled={isUploadingImage}
								class="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-900 text-blue-300 font-semibold border border-blue-800/50 transition-colors flex items-center gap-1 disabled:opacity-50"
								title="Upload Picture to R2 and insert inline"
							>
								<span>📷</span>
								<span>{isUploadingImage ? 'Uploading...' : 'Picture'}</span>
							</button>

							<button
								type="button"
								onclick={() => attachmentFileInput?.click()}
								disabled={isUploadingAttachment}
								class="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 font-semibold border border-emerald-800/50 transition-colors flex items-center gap-1 disabled:opacity-50"
								title="Upload PDF or Document to R2 and insert download card"
							>
								<span>📎</span>
								<span>{isUploadingAttachment ? 'Uploading...' : 'Attach File'}</span>
							</button>
						</div>

						<!-- Visual WYSIWYG Content Editable Area -->
						{#if editorMode === 'visual'}
							<div
								bind:this={visualEditorElement}
								contenteditable="true"
								oninput={(e) => {
									handleVisualInput(e);
									updateFormattingState();
								}}
								onkeydown={handleEditorKeyDown}
								onkeyup={updateFormattingState}
								onmouseup={updateFormattingState}
								onpointerup={updateFormattingState}
								onfocus={updateFormattingState}
								role="textbox"
								tabindex="0"
								class="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-slate-100 min-h-[420px] focus:outline-none focus:border-red-500/70 transition-all font-sans leading-relaxed shadow-inner overflow-y-auto prose-document"
								style="outline: none;"
							></div>
						{:else}
							<!-- HTML Code Area -->
							<textarea
								id="codeEditor"
								rows="18"
								bind:value={docContentHtml}
								placeholder="Write rich HTML here..."
								class="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 text-xs font-mono text-cyan-200 min-h-[420px] focus:outline-none focus:border-cyan-500/70 transition-all leading-relaxed shadow-inner"
							></textarea>
						{/if}

						<div class="flex items-center justify-between text-[11px] text-slate-400">
							<span>
								💡 <strong>Tip:</strong> You can upload pictures and official attachments (PDF, Word, Excel) directly to Cloudflare R2 using the toolbar buttons.
							</span>
							<span class="font-mono">
								{docContentHtml.length} characters
							</span>
						</div>
					</div>

					<!-- Attached Documents Tray -->
					<div class="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2.5">
								<span class="text-base">📎</span>
								<h3 class="text-sm font-bold text-white">
									Attached Files for this Document ({uploadedAttachments.length})
								</h3>
								<span class="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
									Cloudflare R2 Bucket
								</span>
							</div>

							<button
								type="button"
								onclick={() => attachmentFileInput?.click()}
								disabled={isUploadingAttachment}
								class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow"
							>
								<span>➕</span>
								<span>Upload More Files</span>
							</button>
						</div>

						{#if uploadedAttachments.length > 0}
							<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
								{#each uploadedAttachments as att (att.id)}
									<div class="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
										<div class="flex items-center gap-2.5 min-w-0">
											<div class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-sm shrink-0">
												{getFileIcon(att.fileName)}
											</div>
											<div class="min-w-0">
												<div class="text-xs font-bold text-white truncate" title={att.fileName}>
													{att.fileName}
												</div>
												<div class="text-[10px] text-slate-400">
													{att.fileSize}
												</div>
											</div>
										</div>

										<div class="flex items-center gap-1.5 shrink-0">
											<button
												type="button"
												onclick={() => insertAttachmentCard(att)}
												class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 transition-colors"
												title="Insert download card into editor"
											>
												Insert Card
											</button>
											<button
												type="button"
												onclick={() => copyAttachmentUrl(att)}
												class="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
												title="Copy URL"
											>
												{attachmentCopiedId === att.id ? '✓' : '🔗'}
											</button>
											<button
												type="button"
												onclick={() => removeAttachment(att.id)}
												class="p-1 rounded-lg bg-red-950 hover:bg-red-900 text-xs text-red-300 transition-colors"
												title="Remove from document"
											>
												✕
											</button>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-xs text-slate-400 py-3 text-center bg-slate-950/60 rounded-2xl border border-slate-800/60">
								No attachments uploaded yet. Click <strong>Upload More Files</strong> or <strong>Attach File</strong> above to attach official PDFs or Word documents.
							</p>
						{/if}
					</div>

					<!-- Bottom Sticky Actions Bar -->
					<div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
						<button
							type="button"
							onclick={closeStudio}
							class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
						>
							Cancel
						</button>

						<div class="flex items-center gap-3">
							<button
								type="submit"
								onclick={() => (docStatus = 'draft')}
								class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold transition-all"
							>
								Save as Draft
							</button>

							<button
								type="submit"
								onclick={() => (docStatus = 'published')}
								class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-red-600/30"
							>
								Publish Document Page Live &rarr;
							</button>
						</div>
					</div>
				</form>
			{:else}
				<!-- LIVE PREVIEW TAB -->
				<div class="space-y-6">
					<!-- Preview Controls Bar -->
					<div class="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
						<div class="flex items-center gap-2">
							<span class="text-slate-400">Preview Device:</span>
							<button
								type="button"
								onclick={() => (previewDevice = 'desktop')}
								class="px-3 py-1 rounded-lg transition-all {previewDevice === 'desktop' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}"
							>
								🖥️ Desktop
							</button>
							<button
								type="button"
								onclick={() => (previewDevice = 'mobile')}
								class="px-3 py-1 rounded-lg transition-all {previewDevice === 'mobile' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'}"
							>
								📱 Mobile
							</button>
						</div>

						<div class="flex items-center gap-3 text-[11px] text-slate-400">
							<span>Access: <strong class="text-cyan-300 uppercase">{docVisibility}</strong></span>
							<span>•</span>
							<span>Status: <strong class="text-white uppercase">{docStatus}</strong></span>
						</div>
					</div>

					<!-- Simulated Public Page Container -->
					<div class="flex justify-center">
						<div class="w-full transition-all duration-300 {previewDevice === 'mobile' ? 'max-w-sm rounded-3xl border-4 border-slate-700 shadow-2xl p-4 bg-slate-950' : 'max-w-4xl p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl'}">
							<div class="space-y-8">
								<!-- Header -->
								<div class="space-y-4 pb-6 border-b border-slate-800">
									<div class="flex items-center gap-2 text-xs flex-wrap">
										<span class="px-2.5 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold uppercase">
											{effectiveCategory}
										</span>
										{#if docVisibility === 'public'}
											<span class="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold">🌐 Public</span>
										{:else if docVisibility === 'members'}
											<span class="px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800/60 text-[10px] font-bold">🍁 Members Only</span>
										{:else if docVisibility === 'bod'}
											<span class="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/60 text-[10px] font-bold">🛡️ BOD Only</span>
										{:else}
											<span class="px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/60 text-[10px] font-bold">🔒 Admin Only</span>
										{/if}
										<span class="text-slate-400 text-[11px]">Preview Mode</span>
									</div>
									<h1 class="text-2xl sm:text-4xl font-black text-white">
										{docTitle || 'Untitled Document Page'}
									</h1>
									{#if docSummary}
										<p class="text-slate-300 text-sm bg-slate-900/60 border-l-4 border-red-600 p-3 rounded-r-xl">
											{docSummary}
										</p>
									{/if}
								</div>

								{#if docBannerUrl}
									<div class="rounded-2xl overflow-hidden border border-slate-800">
										<img src={docBannerUrl} alt="Banner" class="w-full max-h-64 object-cover" />
									</div>
								{/if}

								<!-- Body -->
								<div class="prose-document bg-slate-900/30 p-6 rounded-2xl border border-slate-800/80">
									{@html docContentHtml}
								</div>

								<!-- Attachments preview -->
								{#if uploadedAttachments.length > 0}
									<div class="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
										<div class="text-xs font-bold text-white flex items-center gap-2">
											<span>📎</span>
											<span>Official Downloadable Attachments ({uploadedAttachments.length})</span>
										</div>
										<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
											{#each uploadedAttachments as att}
												<div class="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
													<div class="truncate">
														<div class="font-bold text-white truncate">{att.fileName}</div>
														<div class="text-[10px] text-slate-400">{att.fileSize}</div>
													</div>
													<span class="px-2 py-1 rounded bg-red-600 text-white font-bold text-[10px]">
														Download &darr;
													</span>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal && docToDelete}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
		<div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
			<div class="w-12 h-12 rounded-2xl bg-red-950 border border-red-800/60 text-red-400 flex items-center justify-center text-2xl mx-auto">
				🗑️
			</div>

			<div class="text-center space-y-2">
				<h3 class="text-lg font-bold text-white">Delete Document Page?</h3>
				<p class="text-xs text-slate-300 leading-relaxed">
					Are you sure you want to permanently delete <strong>"{docToDelete.title}"</strong>? This will remove the document page from the website.
				</p>
			</div>

			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
						showDeleteModal = false;
						docToDelete = null;
						showToast('Document deleted successfully');
					};
				}}
				class="flex items-center justify-end gap-3 pt-2"
			>
				<input type="hidden" name="id" value={docToDelete.id} />
				<button
					type="button"
					onclick={() => {
						showDeleteModal = false;
						docToDelete = null;
					}}
					class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
				>
					Cancel
				</button>
				<button
					type="submit"
					class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors shadow-lg shadow-red-600/30"
				>
					Yes, Delete Document
				</button>
			</form>
		</div>
	</div>
{/if}
