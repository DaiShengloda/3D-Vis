$(document).ready(function() {
	it.util.preLoadImage('./images/flare.png');
    it.util.preLoadImage('./images/bg.jpg');
    it.util.preLoadImage('./images/earth02.png');
    it.util.preLoadImage('./images/earth01.jpg');
    it.util.preLoadImage('./images/dc2.png');

    var dataManager = new it.DataManager();
    var sceneManager = main.sceneManager = new it.SceneManager(dataManager);
    //定义了一个默认的自定义地球场景：
    // var ces = new it.CustomEarthSceneView('earth', main.sceneManager);
    var ces = new it.EarthSceneView('earth', main.sceneManager);
    main.sceneManager.registerCustomSceneView('earth', ces);

    ces.show();

    // var mainDiv = document.body;
    var mainDiv = document.getElementById('itv-main');
    mainDiv.appendChild(sceneManager.getSceneView(true));
    sceneManager.loadScene();
    

});