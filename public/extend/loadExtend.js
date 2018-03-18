$(function() {
    // 加载扩展的ViewTemplate
    it.util.loadJs('./extend/definedViewTemplate.js');
    it.util.loadJs('./extend/AVBillboardViewTemplate.js');
    it.util.loadJs('./extend/TwoPropVT.js');
    it.util.loadJs('./extend/SinglePropVT.js');
    it.util.loadJs('./extend/MutilPropVT.js');

    var f = function() {
        setTimeout(function() {
            if (it.ViewTemplateManager) {
                // 根据category注册ViewTemplate
                it.ViewTemplateManager.registerBatchViewByCategory('airConditioning', SinglePropVT);
                it.ViewTemplateManager.registerBatchViewByCategory('dingxinji', MutilPropVT);
                it.ViewTemplateManager.registerBatchViewByCategory('pinwangyinhuaji', MutilPropVT);
                it.ViewTemplateManager.registerBatchViewByCategory('ranseji', MutilPropVT);
                it.ViewTemplateManager.registerBatchViewByCategory('tuizhutuizhupiaoji', MutilPropVT);
                it.ViewTemplateManager.registerBatchViewByCategory('yuanwangyinhuaji', MutilPropVT);

                // it.ViewTemplateManager.registerBatchViewByCategory('dianchizu', SinglePropVT);

                // it.ViewTemplateManager.registerBatchViewByCategory('ups', MutilPropVT);
                //    it.ViewTemplateManager.registerBatchViewByCategory('widget', MutilPropVT);
                //    it.ViewTemplateManager.registerBatchViewByCategory('ups3', MutilPropVT);
                //    it.ViewTemplateManager.registerBatchViewByCategory('widget', MutilPropVT);
                //    it.ViewTemplateManager.registerBatchViewByCategory('environ', MutilPropVT);
            } else {
                f();
            }
        }, 1000);
    };
    f();
});