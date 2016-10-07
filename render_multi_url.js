// Render Multiple URLs to file

"use strict";
var RenderUrlsToFile, arrayOfUrls, system;

system = require("system");

var environment = 2; // <-- Altere aqui          <----------------------- // 1 = HML WUNDERMAN | 2 = HOM ASSINE | 3 = PROD ASSINE
var OS = '12648'; // <-- Altere aqui                                     
var page = "oferta/internet-banda-larga"; // <-- Altere aqui              
var region = ["CURITIBA_PR", "ARUJA_SP", "NAVEGANTES_SC"]; // <-- Altere aqui

// top_a ALMIRANTE-TAMANDARE_PR
// top_a_300 SALVADOR_BA
// top_b BENTO-GONCALVES_RS
// top_b_300 FORTALEZA_CE
// especial_a BLUMENAU_SC
// especial_a_300 CURITIBA_PR
// especial_b NITEROI_RJ
// especial_b_300 BELO-HORIZONTE_MG
// premium_a ALAGOINHAS_BA
// premium_b ALVORADA_RS
// gpon_a NAVEGANTES_SC
// gpon_b SETE-LAGOAS_MG
// gpon_c TIMOTEO_MG
// default_sp MONTEIRO-LOBATO_SP
// fibra_SP_soft SAO-PAULO_SP
// fibra_SP_soft_vivo2 ARARAQUARA_SP
// vdsl_soft ARUJA_SP
// onnet_stv_premium RONDONOPOLIS_MT
// onnet_stv_top_a VARZEA-GRANDE_MT
// onnet_stv_top_b PASSO-FUNDO_RS
// offnet PARANAGUA_PR

if (environment == 1) {
    var domain = 'hml.assine.vivo.clientes.ananke.com.br'; 
    var path = "assine-hml-wunderman";
}else if (environment == 2) {
    var domain = 'hom-assine.vivomktdigital.com.br'; 
    var path = "assine-hom";
}else if (environment == 3) {
    var domain = 'assine.vivo.com.br'; 
    var path = "assine-prod";
}
var dirAssine = domain + '/' + region + '/' + page;
var pageName = page.replace(/\//g,'__');
pageName = OS + '/' + pageName;
dirAssine = dirAssine.replace(/\//g,'');

var d = new Date(); 
var currentMonth = d.getMonth() + 1;
var currentDay = d.getDate();
var dt = new Date();
var currentHour = dt.getHours();
var currentMinutes = dt.getMinutes();
if (currentMonth < 10) {
    currentMonth = '0' + currentMonth +'';
}
if (currentDay < 10) {
    currentDay = '0' + currentDay +'';
}   
if (currentMinutes < 10) {
    currentMinutes = '0' + currentMinutes +'';
}

var visuals = ['desktop', 'tablet', 'mobile'];

/*
Render given urls
@param array of URLs to render
@param callbackPerUrl Function called after finishing each URL, including the last URL
@param callbackFinal Function called after finishing everything
*/
RenderUrlsToFile = function(urls, callbackPerUrl, callbackFinal) {
    var getFilename, next, page, retrieve, urlIndex, webpage;
    urlIndex = 0;
    var urlCountRegions = 0;
    webpage = require("webpage");
    page = null;
    
    next = function(status, url, file) {
        page.close();
        callbackPerUrl(status, url, file);
        return retrieve();
    };
    retrieve = function() {
        var url;
        if (urls.length > 0) {            
            url = urls.shift();
            urlIndex++;
            page = webpage.create();
            var heightContent = page.evaluate(function(){
                var body = document.body, html = document.documentElement;
                var heightPage = Math.max( body.scrollHeight, body.offsetHeight, 
                                   html.clientHeight, html.scrollHeight, html.offsetHeight );
                return heightPage;
            }); 

            var currentVisual = "";                    
            var currentRegion = "";
            if (urlIndex == 1) {
                currentRegion = arrayOfRegions[urlCountRegions];
                currentVisual = 'desktop';
                page.viewportSize = {
                    width: 1400,
                    height: heightContent
                };  
            }else if (urlIndex == 2) {
                currentRegion = arrayOfRegions[urlCountRegions];
                currentVisual = 'tablet';
                page.viewportSize = {
                    width: 768,
                    height: heightContent
                };  
            }else if (urlIndex == 3) {
                currentRegion = arrayOfRegions[urlCountRegions];
                currentVisual = 'mobile';
                page.viewportSize = {
                    width: 360,
                    height: heightContent
                }; 
                urlIndex = 0;
                urlCountRegions = urlCountRegions + 1;
            }
            var fileName = "./" + path + "_" + pageName + '_' + currentDay + '-' + currentMonth + '_' + currentHour + '-' + currentMinutes + "_" + currentRegion +"_" + currentVisual + ".png";
            getFilename = function() {
                return fileName;
            };
            var customCSS = '.content-links svg { width: 22px !important; height: 22px !important; margin: 10px 0 0 -55px !important; } .list-breadcrumb .breadcrumb-item .breadcrumb-link { margin: 0 0 0 25px !important;} .middle-content .access-form { margin-right: -5px !important;} .dropdown-select-place { margin-top: -84px !important; margin-left: 800px !important; float: right !important; } .dropdown-city svg { width: 22px !important; height: 22px !important; margin: 35px 0 0 -55px !important; } .ico-card { height: 48px !important; width: 48px !important; fill: #609 !important; }';
            page.settings.userAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko)";
            return page.open("http://" + url, function(status) {
                var file;
                file = getFilename();

                page.evaluate(function(customCSS) {
                    var style = document.createElement('style');
                    var text  = document.createTextNode(customCSS);
                    style.setAttribute('type', 'text/css');
                    style.appendChild(text);

                    document.head.insertBefore(style, document.head.firstChild);
                  }, customCSS);

                if (status === "success") {
                    return window.setTimeout((function() {
                        page.render(file);
                        return next(status, url, file);                        
                    }), 2000);
                } else {
                    return next(status, url, file);
                }
            });
        }else {
            return callbackFinal();
        }   
    };
    return retrieve();
};

arrayOfUrls = [];
var arrayOfRegions = [];

for (var i = 0; i < region.length; i++) {
    for (var j = 0; j < 3; j++) {
        arrayOfUrls.push("" + domain + "/" + region[i] + "/" + page + "/");
    }
    arrayOfRegions.push(region[i]);
}

if (system.args.length > 1) {
    arrayOfUrls = Array.prototype.slice.call(system.args, 1);
} else {
    console.log("Usage: phantomjs render_multi_url.js [domain.name1, domain.name2, ...]");
}

RenderUrlsToFile(arrayOfUrls, (function(status, url, file) {
    if (status !== "success") {
        return console.log("Unable to render '" + url + "'");
    } else {
        return console.log("******************************************************************************\nSaved '" + file + "'\n******************************************************************************");
    }
}), function() {
    return phantom.exit();
});