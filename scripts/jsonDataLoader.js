"use strict";

function loadMisc() {
    $.ajax({
        url: "json/misc.json",
    }).done((data) => {
        console.log("misc load complete");
        $.each(data, function(i,prop){
            $.each(prop, function (name,val) {
                miscLoadedValues[name] = val;
            })
        });
        loadPatchnotes();
    });
}

function loadPatchnotes() {
    $.ajax({
        url: "json/patchNotes.json",
    }).done((data) => {
        console.log("patch notes load complete");
        $.each(data, function(i,props){
            const patch = new PatchNote(props);
            PatchManager.addPatch(patch,true);
        });
        loadMaterials();
    });
}

function loadMaterials() {
    $.ajax({
        url: "json/materials.json",
    }).done((data) => {
        console.log("material load complete");
        $.each(data, function(i,props){
            const material = new Material(props);
            ResourceManager.addNewMaterial(material);
        });
        loadRecipes();
    });
}

function loadRecipes() {
    $.ajax({
        url: "json/recipes.json",
    }).done((data) => {
        console.log("recipe load complete");
        $.each(data, function(i,props){
            const item = new Item(props);
            recipeList.addItem(item);
        });
        loadWorkers();
    });
};

function loadWorkers() {
    $.ajax({
        url: "json/workers.json",
    }).done((data) => {
        console.log("worker load complete");
        $.each(data, function(i,props){
            const worker = new Worker(props);
            WorkerManager.addWorker(worker);
        });
        loadHeroes();
    });
}

function loadHeroes() {
    $.ajax({
        url: "json/heroes.json",
    }).done((data) => {
        console.log("hero load complete");
        $.each(data, function(i,props){
            const hero = new Hero(props);
            HeroManager.addHero(hero);
        });
        loadGuilds();
    });
}

function loadGuilds() {
    $.ajax({
        url: "json/guilds.json",
    }).done((data) => {
        console.log("guild load complete");
        $.each(data, function(i,props){
            const guild = new Guild(props)
            GuildManager.addGuild(guild);
        });
        loadPerks();
    });
}

function loadPerks() {
    $.ajax({
        url: "json/perks.json",
    }).done((data) => {
        console.log("perk load complete");
        $.each(data, function(i,props){
            const perk = new alRewards(props);
            ActionLeague.addPerk(perk);
        });
        loadMobs();
    });
}

function loadMobs() {
    $.ajax({
        url: "json/mobs.json",
    }).done((data) => {
        console.log("mob load complete");
        $.each(data, function(i,props){
            const mob = new MobTemplate(props);
            MobManager.addMob(mob);
        });
        loadEvents();
    });
}

function loadEvents() {
    $.ajax({
        url: "json/events.json",
    }).done((data) => {
        console.log("event load complete");
        $.each(data, function(i,props){
            const event = new Event(props)
            EventManager.loadEvent(event);
        });
        loadDungeons();
        //afterLoad();
    });
}

function loadDungeons() {
    $.ajax({
        url: "json/dungeons.json",
    }).done((data) => {
        console.log("dungeon load complete");
        $.each(data, function(i,props){
            const event = new Dungeon(props)
            DungeonManager.addDungeon(event);
        });
        loadDungeonFloors();
    });
}

function loadDungeonFloors() {
    $.ajax({
        url: "json/dungeonFloors.json",
    }).done((data) => {
        console.log("dungeon floors load complete");
        $.each(data, function(i,props){
            const floor = new FloorTemplate(props);
            FloorManager.addFloor(floor);
        });
        afterLoad();
    });
}