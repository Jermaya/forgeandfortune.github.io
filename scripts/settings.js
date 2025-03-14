// Settings Management
// Initial settings code for loading and saving is placed here, 
// place all individual settings code and management in the style.js file

const settings = {
    toastPosition: "top-left",
    dialogStatus: 0,
    battleLogLength: 30,
    toggleTurnOrderBars: 1,
    db: 0,
    expandedLogistics: {
        workers: 1, 
        materials: 0
    },
    expandedMaterials: {
        D001: 1, 
        D002: 1, 
        D003: 1
    }
}

function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
}

function loadSettings() {
    const obj = JSON.parse(localStorage.getItem("settings"));
    for (let setting in obj) {
        settings[setting] = obj[setting];
    }
    localStorage.setItem("settings", JSON.stringify(settings));
}

function clearSettings() {
    localStorage.removeItem("settings");
    location.replace('/');
}

loadSettings();