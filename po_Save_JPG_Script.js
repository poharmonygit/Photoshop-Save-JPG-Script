// Save a JPEG Copy Script for Photoshop v1.4
// Choose Option: sRGB or Embedded Color Profile | Choose Option: How to Deal with Repeated Filename | Quality: Maximum | Format Option: Standard Baseline
// poharmony

if (documents.length > 0) {
    var doc = activeDocument;
    var originalName = doc.name.replace(/\.[^\.]+$/, '');
    var extension = ".jpg";

    var originalPath;
    try {
        originalPath = doc.path;
    } catch (e) {
        var saveFile = File.saveDialog("Choose a location to save the file", "*.jpg");
        if (saveFile) {
            originalPath = saveFile.path;
            originalName = saveFile.name.replace(/\.[^\.]+$/, '');
        } else {
            alert("No location selected. Operation canceled.");
            done = true;
        }
    }

    if (typeof done !== 'undefined' && done) {
    } else {
        var originalProfile = null;
        try {
            originalProfile = doc.colorProfileName;
        } catch (e) {
            originalProfile = null;
        }

        var profile = askProfileChoice();
        if (profile) {
            var tempConverted = false;

            if (profile === "sRGB") {
                try {
                    doc.convertProfile("sRGB IEC61966-2.1", Intent.PERCEPTUAL, true, true);
                    tempConverted = true;
                } catch (e) {
                    alert("Error converting to sRGB: " + e.message);
                }
            }

            var baseName = originalName + (profile === "sRGB" ? "_edts" : "_edt");
            var newName = baseName + extension;
            var savePath = new File(originalPath + "/" + newName);

            if (savePath.exists) {
                var choice = showOverwriteDialog(newName);
                if (choice === 'cancel') {
                    alert("The operation was canceled.");
                    if (tempConverted && originalProfile) {
                        try { doc.convertProfile(originalProfile, Intent.PERCEPTUAL, true, true); } catch (e) {}
                    }
                } else {
                    if (choice === 'new') {
                        var counter = 2;
                        while (savePath.exists) {
                            newName = baseName + counter + extension;
                            savePath = new File(originalPath + "/" + newName);
                            counter++;
                        }
                    }

                    var saveOptions = new JPEGSaveOptions();
                    saveOptions.quality = 12;
                    saveOptions.embedColorProfile = true;
                    saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
                    saveOptions.matte = MatteType.NONE;

                    doc.saveAs(savePath, saveOptions, true, Extension.LOWERCASE);

                    if (tempConverted && originalProfile) {
                        try { doc.convertProfile(originalProfile, Intent.PERCEPTUAL, true, true); } catch (e) {}
                    }

                    alert(newName + "\nSaved with " + (profile === "sRGB" ? "sRGB" : "embedded") + " profile.");
                }
            } else {

                var saveOptions = new JPEGSaveOptions();
                saveOptions.quality = 12;
                saveOptions.embedColorProfile = true;
                saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
                saveOptions.matte = MatteType.NONE;

                doc.saveAs(savePath, saveOptions, true, Extension.LOWERCASE);

                if (tempConverted && originalProfile) {
                    try { doc.convertProfile(originalProfile, Intent.PERCEPTUAL, true, true); } catch (e) {}
                }

                alert(newName + "\nSaved with " + (profile === "sRGB" ? "sRGB" : "embedded") + " profile.");
            }
        } else {
            alert("The operation was canceled.");
        }
    }
} else {
    alert("No document open!");
}


function askProfileChoice() {
    var win = new Window("dialog", "Color Profile");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 20;

    win.add("statictext", undefined, "Choose Color Profile :");

    var group = win.add("group");
    group.orientation = "row";
    var sRGBBtn = group.add("button", undefined, "sRGB");
    var embedBtn = group.add("button", undefined, "Embedded");
    var cancelBtn = group.add("button", undefined, "Cancel");

    var result = null;

    sRGBBtn.onClick = function () {
        result = "sRGB";
        win.close();
    };
    embedBtn.onClick = function () {
        result = "embedded";
        win.close();
    };
    cancelBtn.onClick = function () {
        result = null;
        win.close();
    };

    win.show();
    return result;
}


function showOverwriteDialog(fileName) {
    var win = new Window("dialog", "File Exists");
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 20;

    win.add("statictext", undefined, "'" + fileName + "' already exists.");
    win.add("statictext", undefined, "What do you want ?");

    var btnGroup = win.add("group");
    btnGroup.orientation = "row";

    var overwriteBtn = btnGroup.add("button", undefined, "Overwrite");
    var newNameBtn = btnGroup.add("button", undefined, "Save Separately");
    var cancelBtn = btnGroup.add("button", undefined, "Cancel");

    var result = null;

    overwriteBtn.onClick = function () {
        result = "overwrite";
        win.close();
    };
    newNameBtn.onClick = function () {
        result = "new";
        win.close();
    };
    cancelBtn.onClick = function () {
        result = "cancel";
        win.close();
    };

    win.show();
    return result;
}