var FlowLinkManager = function(network) {
    this.network = network;
    this.box = this.network.getElementBox();
    this._flowLinks = [];
    this.init();
};

mono.extend(FlowLinkManager, Object, {
    init: function() {
        this.initNetwork();
    },
    initNetwork: function() {
        this.network.setLinkPathFunction(function(linkUI, defaultPoints) {
            var link = linkUI._element;
            if(link.getClient('link.type') === 'flowLink'){
                var f = linkUI.getFromPoint();
                var t = linkUI.getToPoint();
            
                var points = new twaver.List();
                points.add(f);
                points.add(t);
            
                var lineLength = _twaver.math.getDistance(f, t);
                var offset = -lineLength / 5;
                var m = {
                    x: (f.x + t.x) / 2 + offset,
                    y: (f.y + t.y) / 2 + offset
                }
                var cps = new twaver.List();
                cps.add(m);
                cps.add(t);
            
                points.removeAt(1);
                points.add(cps);
            
                return points;
            }else{
                return defaultPoints;
            }
        });
    },
    createFlowLink: function(from,to,linkColor,fillColor) {
        if (!from || !to) return;
        var link = new FlowLink(from, to);
        link.setLayerId('link');
        link.setStyle('link.color', linkColor || '#2DE9FF');
        link.setStyle('link.width', 1);
        link.setClient('fillColor', fillColor || '#FFFFFF');
        link.setClient('shadowColor', fillColor || '#FFFFFF');
        link.setClient('tail', 50);
        link.setClient('link.type','flowLink');
        return link;
    },
    addLink: function(nodeMap) {
        var self = this,
            node,dc,ext,flowLinks,
            toId,toNode,linkColor,fillColor,
            flowLink;
        for(var id in nodeMap){
            node = nodeMap[id];
            dc = main.sceneManager.dataManager.getDataById(id);
            ext = dc.getExtend();
            flowLinks = ext.flowLinks;
            if (!flowLinks) continue;
            for(toId in flowLinks){
                var link = flowLinks[toId];
                toNode = nodeMap[toId];
                linkColor = link.linkColor;
                fillColor = link.fillColor; 
                flowLink = self.createFlowLink(node, toNode, linkColor, fillColor);
                self.box.add(flowLink);
                self.addLinkAnimate(flowLink);
            }      
        }
    },
    addLinkAnimate: function(flowLink) {
        var self = this
        new twaver.Animate({
            from: 0,
            to: 1,
            repeat: Number.POSITIVE_INFINITY,
            reverse: false,
            delay:500,
            dur: 3000,
            easing: 'easeOutStrong',
            onUpdate: function (value) {
                flowLink.setClient('percent',value);
                self.network.invalidateElementUIs();  
            }
        }).play();
    }
});

function FlowLink () {
    FlowLink.superClass.constructor.apply(this, arguments);
}
  
twaver.Util.ext(FlowLink, twaver.Link, {
    getVectorUIClass: function() {
        return FlowLinkUI;
    }
});
  
function FlowLinkUI () {
    FlowLinkUI.superClass.constructor.apply(this, arguments);
}
  
twaver.Util.ext(FlowLinkUI, twaver.vector.LinkUI, {
    paintBody: function (ctx) {
        FlowLinkUI.superClass.paintBody.call(this, ctx);
        var link = this.getElement();
        var fillColor = link.getClient('fillColor');
        var shadowColor = link.getClient('shadowColor');
        var tail = link.getClient('tail');
        var percent = link.getClient('percent');
        var paths = this.getLinkPoints();
        var offset = this.getLineLength() * percent;
        var point;

        for (var i = 0, count = tail; i < count; i++) {
            var v = i / count,radius;
            point = _twaver.math.calculatePointInfoAlongLine(paths, true, offset - (count - i)*1.5, 0).point;
            ctx.globalAlpha = v * v;
            ctx.shadowBlur = 1;
            ctx.shadowColor = shadowColor;
            ctx.beginPath();
            ctx.fillStyle = fillColor;
            radius = 2;
            ctx.arc(point.x, point.y, radius, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }
});