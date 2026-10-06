function isJpegUrl(url) {
    if (!url) {
        return false;
    }

    try {
        const parsed = new URL(url);

        const pathname = parsed.pathname.toLowerCase();

        return pathname.endsWith(".jpg") ||
               pathname.endsWith(".jpeg");
    }
    catch {
        return false;
    }
}

function getFileName(url) {
    try {
        const parsed = new URL(url);

        let fileName = parsed.pathname.split("/").pop();

        if (!fileName) {
            fileName = "image.jpg";
        }

        // Decode URL-encoded characters
        fileName = decodeURIComponent(fileName);

        // Remove characters Windows doesn't allow in filenames
        fileName = fileName.replace(/[<>:"/\\|?*]/g, "_");

        return fileName;
    }
    catch {
        return "image.jpg";
    }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {

    // Only react when the URL has actually changed.
    if (!changeInfo.url) {
        return;
    }

    const url = changeInfo.url;

    if (!isJpegUrl(url)) {
        return;
    }

    const fileName = getFileName(url);

    try {
        await chrome.downloads.download({
            url: url,
            filename: `ExtensionDownload/${fileName}`,
            conflictAction: "uniquify",
            saveAs: false
        });

        // Give Chrome a moment to start the download.
        setTimeout(() => {
            chrome.tabs.remove(tabId).catch(() => {});
        }, 300);

    }
    catch (error) {
        console.error("JPEG download failed:", error);
    }
});