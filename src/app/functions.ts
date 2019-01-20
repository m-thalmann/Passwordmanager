export function copyToClipboard(item: string) {
    document.addEventListener('copy', (e: ClipboardEvent) => {
        e.clipboardData.setData('text/plain', (item));
        e.preventDefault();
        document.removeEventListener('copy', null);
    });
    document.execCommand('copy');
}