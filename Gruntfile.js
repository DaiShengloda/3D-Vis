var fs = require('fs'),
    path = require('path'),
    secret = require('./secret.json');

module.exports = function(grunt) {
    grunt.initConfig({
        // config: grunt.file.readJSON('config.json'),
        name: 'IT',
        srcITDir: 'D:/git/new-theme',
        destITDir: 'D:/3D_Pack/itv_server_grunt/resource/',
        srcITClientDir: 'D:/git/new-theme/public/',
        destTClientDir: 'D:/3D_Pack/itv_server_grunt/resource/public/',
        secret: secret,

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                node: true,
                es5: true
            },
            files: {
                src: ['D:/3D_Pack/itv_server_grunt/public/lib/t.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-ssh');
    grunt.loadNpmTasks('grunt-es6-module-transpiler');
    grunt.loadNpmTasks('grunt-node-optimize');
    grunt.loadNpmTasks('grunt-node-optimize');
    grunt.loadNpmTasks('grunt-regenerator');

    grunt.config('copy.itv', {
        files: [
            { expand: true, cwd: '<%= srcITDir %>', src: ['**', "!node_modules"], dest: '<%=destITDir%>/' },
        ]
    });

//把test下面的testReceiver.html复制到打包文件
     grunt.config('copy.test', {
        files: [
            { expand: true, cwd: '<%= srcITDir %>', src: ['public/test/testReceiver.html','public/test/testSender1.html','public/js/panel/*.js','script/orm/Link.js'], dest: '<%=destITDir%>/' },
        ]
    });

    grunt.config('replace.index', {
        src: ['<%= srcITDir %>/public/index.html'],
        dest: '<%= destITDir %>/public/',
        replacements: [{
                from: '<script type="text/javascript" src="./js/Main.js"></script>',
                to: 'temp/compress/itv-client-min.js'
            }, {
                from: /\<script .*\"js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/twaver.js"\>\<\/script\>/g,
                to: ''
            },
            // { //2016-12-28 make不合并到core中
            //     from: /\<script .*\".\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\".\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/itv-all-min.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="./js/config.js"></script>'
            }, {
                from: /\<script .*\".\/libs\/t.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="./libs/core-twaver.js"></script>'
            }, {
                from: 'temp/compress/itv-client-min.js',
                to: '<script type="text/javascript" src="./js/compress/itv-client-min.js"></script>',
            }
        ]
    });

    grunt.config('replace.rackEditor', {
        src: ['<%= srcITDir %>/public/rackEditor.html'],
        dest: '<%= destITDir %>/public/',
        replacements: [
            // { //2016-12-28 make不合并到core中
            //     from: /\<script .*\"..\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\".\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/itv-all-min.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="./libs/core-twaver.js"></script>'
            },
        ]
    });

    grunt.config('replace.admin', {
        src: ['<%= srcITDir %>/public/admin/index.html'],
        dest: '<%= destITDir %>/public/admin/',
        replacements: [
            // { //2016-12-28 make不合并到core中
            //     from: /\<script .*\"..\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\"..\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/t.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="../libs/core-twaver.js"></script>'

            }, {
                from: /\<script .*\"..\/libs\/itv-all-min.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/twaver.js"\>\<\/script\>/g,
                to: ''
            },
        ]
    });

    grunt.config('replace.deveditor', {
        src: ['<%= srcITDir %>/public/admin/deviceEditor.html'],
        dest: '<%= destITDir %>/public/admin/',
        replacements: [
            // {//2016-12-28 make不合并到core中
            //     from: /\<script .*\"..\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\"..\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="../libs/core-twaver.js"></script>'
            },
        ]
    });

    grunt.config('replace.data', {
        src: ['<%= srcITDir %>/public/admin/data.html'],
        dest: '<%= destITDir %>/public/admin/',
        replacements: [
            // { //2016-12-28 make不合并到core中
            //     from: /\<script .*\"..\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\"..\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="../libs/core-twaver.js"></script>'
            },
        ]
    });

    grunt.config('replace.datatype', {
        src: ['<%= srcITDir %>/public/admin/datatype.html'],
        dest: '<%= destITDir %>/public/admin/',
        replacements: [
            // { //2016-12-28 make不合并到core中
            //     from: /\<script .*\"..\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\"..\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="../libs/core-twaver.js"></script>'
            },
            //                {
            //                    from: 'temp/compress/itv-admin-min.js',
            //                    to: '<script type="text/javascript" src="./js/compress/itv-admin-min.js"></script>',
            //                }
        ]
    });

    grunt.config('replace.tempjsIndex', {
        src: ['<%= srcITDir %>/public/admin//tempjs/index.html'],
        dest: '<%= destITDir %>/public/admin/',
        replacements: [
            // { //2016-12-28 make不合并到core中
            //     from: /\<script .*\"..\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\"..\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/twaver.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/t.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="../libs/core-twaver.js"></script>'
            },
        ]
    });

    grunt.config('replace.scene', {
        src: ['<%= srcITDir %>/public/admin/scene.html'],
        dest: '<%= destITDir %>/public/admin/',
        replacements: [
            // { //2016-12-28 make不合并到core中
            //     from: /\<script .*\"..\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\"..\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\"..\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="../libs/core-twaver.js"></script>'
            },
        ]
    });

    grunt.config('replace.app', {
        src: ['<%= srcITDir %>/app/app.html'],
        dest: '<%= destITDir %>/app/',
        replacements: [
            // { //2016-12-28 make不合并到core中
            //     from: /\<script .*\".\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\".\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/itv-all-min.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="./libs/core-twaver.js"></script>'
            }, {
                from: '<script type="text/javascript" src="./js/app.js"></script>',
                to: 'temp/compress/itv-client-min.js'
            }, {
                from: /\<script .*\"js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: 'temp/compress/itv-client-min.js',
                to: '<script type="text/javascript" src="./js/compress/itv-client-min.js"></script><script type="text/javascript" src="./js/app.js"></script>',
            },
        ]
    });

    grunt.config('replace.floor', {
        src: ['<%= srcITDir %>/app/floor.html'],
        dest: '<%= destITDir %>/app/',
        replacements: [
            // {
            //     from: /\<script .*\".\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\".\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/itv-all-min.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="./libs/core-twaver.js"></script>'
            }, {
                from: '<script type="text/javascript" src="./js/app.js"></script>',
                to: 'temp/compress/itv-client-min.js'
            }, {
                from: /\<script .*\"js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: 'temp/compress/itv-client-min.js',
                to: '<script type="text/javascript" src="./js/compress/itv-client-min.js"></script><script type="text/javascript" src="./js/app.js"></script>',
            },
        ]
    });

    grunt.config('replace.rack', {
        src: ['<%= srcITDir %>/app/rack.html'],
        dest: '<%= destITDir %>/app/',
        replacements: [
            // {
            //     from: /\<script .*\".\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\".\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/itv-all-min.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="./libs/core-twaver.js"></script>'
            }, {
                from: '<script type="text/javascript" src="./js/app.js"></script>',
                to: 'temp/compress/itv-client-min.js'
            }, {
                from: /\<script .*\"js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: 'temp/compress/itv-client-min.js',
                to: '<script type="text/javascript" src="./js/compress/itv-client-min.js"></script><script type="text/javascript" src="./js/app.js"></script>',
            },
        ]
    });

    grunt.config('replace.second', {
        src: ['<%= srcITDir %>/app/second.html'],
        dest: '<%= destITDir %>/app/',
        replacements: [
            // {
            //     from: /\<script .*\".\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\".\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/itv-all-min.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="./libs/core-twaver.js"></script>'
            }, {
                from: '<script type="text/javascript" src="./js/app.js"></script>',
                to: 'temp/compress/itv-client-min.js'
            }, {
                from: /\<script .*\"js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: 'temp/compress/itv-client-min.js',
                to: '<script type="text/javascript" src="./js/compress/itv-client-min.js"></script><script type="text/javascript" src="./js/app.js"></script>',
            },
        ]
    });

    grunt.config('replace.third', {
        src: ['<%= srcITDir %>/app/third.html'],
        dest: '<%= destITDir %>/app/',
        replacements: [
            // {
            //     from: /\<script .*\".\/libs\/twaver-make.js"\>\<\/script\>/g,
            //     to: ''
            // },
            {
                from: /\<script .*\".\/libs\/twaver-doodle.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/mono_toolkits.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/t.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/itv-all-min.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/libs\/twaver.js"\>\<\/script\>/g,
                to: '<script type="text/javascript" src="./libs/core-twaver.js"></script>'
            }, {
                from: '<script type="text/javascript" src="./js/app.js"></script>',
                to: 'temp/compress/itv-client-min.js'
            }, {
                from: /\<script .*\"js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: /\<script .*\".\/js\/.*\.js"\>\<\/script\>/g,
                to: ''
            }, {
                from: 'temp/compress/itv-client-min.js',
                to: '<script type="text/javascript" src="./js/compress/itv-client-min.js"></script><script type="text/javascript" src="./js/app.js"></script>',
            },
        ]
    });

    grunt.config('replace.online1', {
        src: ['<%= srcITDir %>/package.json'],
        dest: '<%= destITDir %>/',
        replacements: [{
            from: 'supervisor --debug --harmony script/index.js',
            to: "forever start -o o.log -e e.log -l l.log -a -c 'node --harmony' script/index.js",
        }]
    });

    grunt.config('replace.online2', {
        src: ['<%= srcITDir %>/script/config.js'],
        dest: '<%= destITDir %>/script/',
        replacements: [{
            from: "password: '123'",
            to: " password: '103360145'",
        }, {
            from: "database: 'itv_nanjin'",
            to: " database : 'itv'"
        }, {
            from: "database: 'itv_alex'",
            to: " database : 'itv'"
        }, {
            from: "port: 8081",
            to: "port : 8090"
        }]
    });

    grunt.config('replace.publish', {
        src: ['<%= srcITDir %>/script/config.js'],
        dest: '<%= destITDir %>/script/',
        replacements: [{
            from: "password: '123'",
            to: " password: 'root'",
        }, {
            from: "database: 'itv_n'",
            to: " database : 'itv'"
        }, {
            from: "port: 3306,",
            to: "port     : 3333,"
        }]
    });


    grunt.config('clean', {
        itvclient: {
            src: ["<%= destITDir %>/public/js/*.js", "!<%= destITDir %>/public/js/config.js", "!<%= destITDir %>/public/js/rackEditor.js", "!<%= destITDir %>/public/js/utils.js","!<%= destITDir %>/public/js/makeTool.js"]
        },
        itvclient2: {
            src: ["<%= destITDir %>/public/js/**/*.js", "!<%= destITDir %>/public/js/compress/itv-client-min.js", "!<%= destITDir %>/public/js/config.js", "!<%= destITDir %>/public/js/rackEditor.js", "!<%= destITDir %>/public/js/utils.js"]
        },
        //      itvadmin: {
        //          src: ["<%= destITDir %>/public/admin/js/*.js"]
        //      },
        //      itvadmin2: {
        //          src: ["<%= destITDir %>/public/admin/js/**/*.js", "!<%= destITDir %>/public/admin/js/compress/itv-admin-min.js"]
        //      },
        orm: {
            src: ['<%= destITDir %>/script/orm']
        },
        twaver: {
            src: ["<%= destITDir %>/public/libs/twaver*.js",
                "<%= destITDir %>/public/libs/t.js",
                "<%= destITDir %>/public/libs/t_*.js",
                "<%= destITDir %>/public/libs/mono_toolkits.js",
                //              "<%= destITDir %>/public/libs/twaver-make-min.js",
                //              "<%= destITDir %>/public/libs/twaver-doodle.js",
                "<%= destITDir %>/public/libs/itv-all-min*.js",
            ]
        },
        customer: {
            src: ["<%= destITDir %>/public/customer",
                "<%= destITDir %>/public/theme_*"
            ]
        },
        testhtml: {
            src: ["<%= destITDir %>/public/test*.html",
                "<%= destITDir %>/public/test",
                // "<%= destITDir %>/*.sql"
            ]
        }
        //    upload : {
        //      src : ['<%= destITDir %>/upload/images/*.*','<%= destITDir %>/upload/images/wrap/*.*','<%= destITDir %>/upload/resource/*.*']
        //    },
    });

    //后台的不合并了，也不要混淆
    //  grunt.config('itvAdminFiles', [
    //      '<%= srcITClientDir %>/admin/js/_start.js',
    //      '<%= srcITClientDir %>/admin/js/util.js',
    //      '<%= srcITClientDir %>/admin/js/main.js',
    //      '<%= srcITClientDir %>/admin/js/Page.js',
    //      '<%= srcITClientDir %>/admin/js/tabManager.js',
    //      '<%= srcITClientDir %>/admin/js/AddDataInfoPage.js',
    //      '<%= srcITClientDir %>/admin/js/UpdateDataInfoPage.js',
    //      '<%= srcITClientDir %>/admin/js/ListPage.js',
    //      '<%= srcITClientDir %>/admin/js/AddPage.js',
    //      '<%= srcITClientDir %>/admin/js/UpdatePage.js',
    //      '<%= srcITClientDir %>/admin/js/CustomField.js',
    ////      data.html
    //      '<%= srcITClientDir %>/admin/js/dataType.js',
    ////      '<%= srcITClientDir %>/admin/js/dataEditor.js', //许修改
    //      //datatyep.html 下面三个已删除
    ////      '<%= srcITClientDir %>/admin/js/AccordionPane.js',
    ////      '<%= srcITClientDir %>/admin/js/Dialog.js',
    ////      '<%= srcITClientDir %>/admin/js/editor.js',
    //
    //      '<%= srcITClientDir %>/admin/js/deviceEditor.js',
    //      '<%= srcITClientDir %>/admin/js/validator.js',
    //      '<%= srcITClientDir %>/admin/js/_end.js',
    //    ]);
    //
    //  grunt.config('concat.itv-admin', {
    //    src: [
    //      '<%= itvAdminFiles %>'
    //    ],
    //    dest: '<%= srcITClientDir %>admin/js/compress/itv-admin.js'
    //  });

    grunt.config('itvClientFiles', [
        '<%= srcITClientDir %>/js/_start.js',
        '<%= srcITClientDir %>/js/utils.js',
        '<%= srcITClientDir %>/js/ServerUtil.js',
        '<%= srcITClientDir %>/js/AlertUtil.js',
        '<%= srcITClientDir %>/js/LoadData.js',
        '<%= srcITClientDir %>/js/Breadcrumb.js',
        '<%= srcITClientDir %>/js/SpaceAvailabilityManager.js',
        '<%= srcITClientDir %>/js/PropertyPane.js',
        '<%= srcITClientDir %>/js/BuildingAnimationManager.js',
        '<%= srcITClientDir %>/js/pdf/PdfViewer.js',
        '<%= srcITClientDir %>/js/pdf/PDFManager.js',
        '<%= srcITClientDir %>/js/pdf/AssetPDFViewManager.js',
        '<%= srcITClientDir %>/js/earth/SphereInteraction.js',
        '<%= srcITClientDir %>/js/toolbar/ConfigApp.js',
        '<%= srcITClientDir %>/js/toolbar/GeneralConfigApp.js',
        // '<%= srcITClientDir %>/js/toolbar/TemperatureAndHumidityConfigPanel.js',
        // '<%= srcITClientDir %>/js/toolbar/UColorSettingPanel.js',
        '<%= srcITClientDir %>/js/toolbar/ToolBarButton.js',
        '<%= srcITClientDir %>/js/toolbar/FilterMenu.js',
        '<%= srcITClientDir %>/js/toolbar/CameraSetting.js',
        '<%= srcITClientDir %>/js/toolbar/CameraMenu.js',
        '<%= srcITClientDir %>/js/toolbar/PlayCameraMenu.js',
        '<%= srcITClientDir %>/js/toolbar/StopCameraMenu.js',
        '<%= srcITClientDir %>/js/toolbar/SaveCameraBar.js',
        '<%= srcITClientDir %>/js/toolbar/OpenFileBar.js',
        '<%= srcITClientDir %>/js/toolbar/BackgroundColor.js',
        '<%= srcITClientDir %>/js/sceneInfo/InfoRule.js',
        // '<%= srcITClientDir %>/js/toolbar/ShowRackNumber.js',
        // '<%= srcITClientDir %>/js/toolbar/Setting.js',
        '<%= srcITClientDir %>/js/jstree/jstree.js',
        '<%= srcITClientDir %>/js/toolbar/ResetDialog.js',
        '<%= srcITClientDir %>/js/toolbar/FullScreen.js',
        '<%= srcITClientDir %>/js/toolbar/HelpDialog.js',
        '<%= srcITClientDir %>/js/toolbar/AlarmButton.js',
        // '<%= srcITClientDir %>/js/toolbar/AddEarthTitle.js',
        // '<%= srcITClientDir %>/js/toolbar/AssetManageImg.js',
        '<%= srcITClientDir %>/js/toolbar/BackgroundColor.js',
        // '<%= srcITClientDir %>/js/toolbar/AssetFilter.js',
        // '<%= srcITClientDir %>/js/toolbar/UnVirtualCategoryForFocus.js',
        '<%= srcITClientDir %>/js/SceneInfoPane.js',
        '<%= srcITClientDir %>/js/NetworkDialog.js',
        '<%= srcITClientDir %>/js/SearchPanel.js',
        '<%= srcITClientDir %>/js/RightClickMenu.js',
        '<%= srcITClientDir %>/js/link/LinkSearch.js',
        '<%= srcITClientDir %>/js/datainfo/BaseServerTab.js',
        '<%= srcITClientDir %>/js/datainfo/BaseVirtualDeviceTab.js',

        '<%= srcITClientDir %>/js/datainfo/GeneralInfo.js',
        '<%= srcITClientDir %>/js/datainfo/panelInfo.js',
        '<%= srcITClientDir %>/js/datainfo/VirtualDevicePanelInfo.js',
        '<%= srcITClientDir %>/js/datainfo/VirtualDeviceRealtimeInfo.js',
        '<%= srcITClientDir %>/js/datainfo/VirtualDeviceRealtimeExtendInfo.js',
         '<%= srcITClientDir %>/js/datainfo/alarmTab.js',
         '<%= srcITClientDir %>/js/datainfo/DeviceListInfo.js',
         '<%= srcITClientDir %>/js/datainfo/StatisticsInfo.js',
        '<%= srcITClientDir %>/js/datainfo/ServerAlarm.js',
        '<%= srcITClientDir %>/js/port/PortOccuPancyManager.js',
        '<%= srcITClientDir %>/js/datainfo/DevPanelManager.js',
        '<%= srcITClientDir %>/js/datainfo/CustomInfo.js',
        '<%= srcITClientDir %>/js/datainfo/demo/LoadTabPanel.js',
        '<%= srcITClientDir %>/js/datainfo/demo/routeTabPanel.js',
        '<%= srcITClientDir %>/js/datainfo/demo/routePanel.js',
        '<%= srcITClientDir %>/js/datainfo/demo/NewTabPanel.js',
        '<%= srcITClientDir %>/js/datainfo/demo/ProcessTabPanel.js',
        '<%= srcITClientDir %>/js/datainfo/demo/InterfacesPanel.js',
        '<%= srcITClientDir %>/js/datainfo/demo/virtualtopologyPanel.js',
        '<%= srcITClientDir %>/js/datainfo/demo/StorageTabPanel.js',
        '<%= srcITClientDir %>/js/datainfo/ServerPanel.js',
        '<%= srcITClientDir %>/js/datainfo/ServerTab.js',
        '<%= srcITClientDir %>/js/datainfo/VirtualDeviceTab.js',
        // '<%= srcITClientDir %>/js/datainfo/Info.js',
        '<%= srcITClientDir %>/js/datainfo/NodeEventHandler.js',

        '<%= srcITClientDir %>/js/util/TextBillboardWithArrow.js',
        '<%= srcITClientDir %>/js/util/TextBillboardWithArrowOld.js',
        '<%= srcITClientDir %>/js/util/dealUserEventHandler.js',
        '<%= srcITClientDir %>/js/util/CustomPanelDialog.js',
        '<%= srcITClientDir %>/js/DeviceLabel.js',
        '<%= srcITClientDir %>/js/window/win.js',
        '<%= srcITClientDir %>/js/panel/BaseMgr.js',
        '<%= srcITClientDir %>/js/panel/PanelMgr.js',
        '<%= srcITClientDir %>/js/itmv/ITVCategory.js',
        '<%= srcITClientDir %>/js/itmv/ITVConfigItem.js',
        '<%= srcITClientDir %>/js/itmv/ITVLayer.js',
        '<%= srcITClientDir %>/js/itmv/ITVConfigItemLayer.js',
        '<%= srcITClientDir %>/js/itmv/ITVRelationType.js',
        '<%= srcITClientDir %>/js/itmv/ITVRelation.js',
        '<%= srcITClientDir %>/js/itmv/ITVDataManager.js',
        '<%= srcITClientDir %>/js/itmv/ITVAlarm.js',
        '<%= srcITClientDir %>/js/itmv/ITVAlarmManager.js',
        '<%= srcITClientDir %>/js/itmv/ITVDefaultModelManager.js',
        '<%= srcITClientDir %>/js/itmv/ITVVisibleManager.js',
        '<%= srcITClientDir %>/js/itmv/ITVVirtualManager.js',
        '<%= srcITClientDir %>/js/itmv/ITVGroupManager.js',
        '<%= srcITClientDir %>/js/itmv/ITVHandler.js',
        '<%= srcITClientDir %>/js/itmv/ITVRelationManager.js',
        '<%= srcITClientDir %>/js/itmv/ITVOutLayouter.js',
        '<%= srcITClientDir %>/js/itmv/ITVManager.js',
        '<%= srcITClientDir %>/js/itmv/ITVPanel.js',
        '<%= srcITClientDir %>/js/itmv/ITVPanelMgr.js',

        '<%= srcITClientDir %>/js/AnimateManager.js',
        '<%= srcITClientDir %>/js/alarm/Alarm.js',
        '<%= srcITClientDir %>/js/alarm/AlarmType.js',
        '<%= srcITClientDir %>/js/alarm/VirtualDeviceAlarm.js',
        '<%= srcITClientDir %>/js/alarm/AlarmStatus.js',
        '<%= srcITClientDir %>/js/alarm/AlarmManager.js',
        '<%= srcITClientDir %>/js/alarm/AlarmTooltip.js',
         '<%= srcITClientDir %>/js/alarm/VirtualDeviceAlarm.js',
        '<%= srcITClientDir %>/js/PowerManager.js',
        '<%= srcITClientDir %>/js/ClientAlarmManager.js',
        '<%= srcITClientDir %>/js/ITVSearchBasePanel.js',
        '<%= srcITClientDir %>/js/ITSearchPane.js',
        '<%= srcITClientDir %>/js/ITSpaceSearchPane.js',
        '<%= srcITClientDir %>/js/InitPropertyDialog.js',
        '<%= srcITClientDir %>/js/DevPanelManager.js',
        '<%= srcITClientDir %>/js/AfterLookAtManager.js',
        '<%= srcITClientDir %>/js/VirtualDeviceManager.js',
        '<%= srcITClientDir %>/js/VirtualDeviceOnManager.js',
        '<%= srcITClientDir %>/js/VirtualDeviceOffManager.js',
        '<%= srcITClientDir %>/js/NameplateManager.js',
        '<%= srcITClientDir %>/js/MicoEnviroment.js',
        '<%= srcITClientDir %>/js/navbar/ItvToggleBtn.js',
        '<%= srcITClientDir %>/js/navbar/NavBarManager.js',
'<%= srcITClientDir %>/js/SearchManager/ITSearchManager.js',


        '<%= srcITClientDir %>/js/navbar/AssetPanelMgr.js',
        '<%= srcITClientDir %>/js/navbar/About.js',
        '<%= srcITClientDir %>/js/navbar/WarningStatisticsMgr.js',
        '<%= srcITClientDir %>/js/navbar/EquipStatisticsMgr.js',
        '<%= srcITClientDir %>/js/navbar/rackClickRotateMgr.js',
        '<%= srcITClientDir %>/js/navbar/loadConfig.js',
        '<%= srcITClientDir %>/js/navbar/WarningRuleConfigMgr.js',


        '<%= srcITClientDir %>/js/app/Application.js',
        '<%= srcITClientDir %>/js/app/AllApps.js',
        '<%= srcITClientDir %>/js/app/ITSearchApp.js',
        '<%= srcITClientDir %>/js/app/SpaceSearchApp.js',
        '<%= srcITClientDir %>/js/app/TempApp.js',
        '<%= srcITClientDir %>/js/app/CoolingPipeApp.js',
        '<%= srcITClientDir %>/js/app/SeatApp.js',
        // '<%= srcITClientDir %>/js/app/SmokeApp.js',
        '<%= srcITClientDir %>/js/app/AppManager.js',
        '<%= srcITClientDir %>/js/app/TempAndHumApp.js',
        '<%= srcITClientDir %>/js/app/SmokeApp.js',
         '<%= srcITClientDir %>/js/usearch/USearchPanel.js',
        '<%= srcITClientDir %>/js/usearch/USearchManager.js',
        '<%= srcITClientDir %>/js/app/USearchApp.js',
        '<%= srcITClientDir %>/js/app/CustomPanelApp.js',
        '<%= srcITClientDir %>/js/appManager/PanoramicManager.js',
        '<%= srcITClientDir %>/js/appManager/RackPreOccupiedManager.js',
        '<%= srcITClientDir %>/js/appManager/UPreOccupiedManager.js',
        '<%= srcITClientDir %>/js/appManager/MulCameraManager.js',
        '<%= srcITClientDir %>/js/appManager/NewCameraManager.js',
        '<%= srcITClientDir %>/js/appManager/RecommendedLocationManager.js',
        '<%= srcITClientDir %>/js/appManager/TobaccoRodManager.js',
        '<%= srcITClientDir %>/js/app/UPreOccupiedApp.js',
        '<%= srcITClientDir %>/js/app/RecommendedLocationApp.js',
        // '<%= srcITClientDir %>/js/app/AllApps.js',
        '<%= srcITClientDir %>/js/airflow/AirFlow.js',
        '<%= srcITClientDir %>/js/WaterLeakManager.js',
        '<%= srcITClientDir %>/js/PowerRackPanel.js',
        '<%= srcITClientDir %>/js/AssetOnApp.js',
        '<%= srcITClientDir %>/js/VideoManager.js',
        '<%= srcITClientDir %>/js/SmokeSensorManager.js',
        '<%= srcITClientDir %>/js/realtime/RealtimeDynamicEnviroManager.js',
        '<%= srcITClientDir %>/js/realtime/RealtimeAlarmManager.js',
        '<%= srcITClientDir %>/js/realtime/RealtimeDataManager.js',
        '<%= srcITClientDir %>/js/realtime/RealtimeLinkManager.js',
        '<%= srcITClientDir %>/js/toolbar/EventManagerMenu.js',
        '<%= srcITClientDir %>/js/monitor/Interface.js',
        '<%= srcITClientDir %>/js/monitor/Monitor.js',
        // '<%= srcITClientDir %>/js/monitor/AllDataDecorator.js',
        '<%= srcITClientDir %>/js/monitor/CameraMonitor.js',
        '<%= srcITClientDir %>/js/monitor/MonitorDecorator.js',
        '<%= srcITClientDir %>/js/monitor/SelectPanelDecorator.js',
        '<%= srcITClientDir %>/js/monitor/RealTimeDecorator.js',
        '<%= srcITClientDir %>/js/monitor/AllDataDecorator.js',
        '<%= srcITClientDir %>/js/monitor/InfoDecorator.js',
        '<%= srcITClientDir %>/js/monitor/InnerInfoDecorator.js',
        '<%= srcITClientDir %>/js/monitor/PortMonitor.js',
        '<%= srcITClientDir %>/js/monitor/MonitorManager.js',
        '<%= srcITClientDir %>/js/realtime/Monitor.js',
        '<%= srcITClientDir %>/js/realtime/EquipmentMonitor.js',
        '<%= srcITClientDir %>/js/realtime/PortMonitor.js',
        '<%= srcITClientDir %>/js/realtime/MonitorManager.js',
        '<%= srcITClientDir %>/js/view/DefaultViewTemplate.js',
        '<%= srcITClientDir %>/js/view/ViewVirtualDeviceTemplate.js',
        '<%= srcITClientDir %>/js/view/ViewAllDataTemplate.js',
        '<%= srcITClientDir %>/js/view/PortStatusViewTemplate.js',
        '<%= srcITClientDir %>/js/view/ViewTemplateManager.js',
        // '<%= srcITClientDir %>/js/view/ViewAllDataTemplate.js',
        '<%= srcITClientDir %>/js/view/KVTextBillboardViewTemplate.js',
        '<%= srcITClientDir %>/js/view/PortStatusViewTemplate.js',
        '<%= srcITClientDir %>/js/view/PortUsageViewTemplate.js',
        '<%= srcITClientDir %>/js/weight/WeightManager.js',
        '<%= srcITClientDir %>/js/DataNavManager.js',
        '<%= srcITClientDir %>/js/post/PostManager.js',
        '<%= srcITClientDir %>/js/inspection/BaseInspectionManager.js',
        '<%= srcITClientDir %>/js/inspection/RoomInspectionManager.js',
        '<%= srcITClientDir %>/js/inspection/RackInspectionManager.js',
        // '<%= srcITClientDir %>/js/HCCNavBarManager.js',
        '<%= srcITClientDir %>/js/jquery-pager.js',
        '<%= srcITClientDir %>/js/DeviceOn.js',
        '<%= srcITClientDir %>/js/DeviceOff.js',
        '<%= srcITClientDir %>/js/RealTime.js',
        '<%= srcITClientDir %>/js/link/LinkAdd.js',
        '<%= srcITClientDir %>/js/monitor.js',
        '<%= srcITClientDir %>/js/AllSpaceSearch.js',
        '<%= srcITClientDir %>/js/port/PortManager.js',
        '<%= srcITClientDir %>/js/port/PortStatusManager.js',
        '<%= srcITClientDir %>/js/animate/CameraAnimateManager.js',
        '<%= srcITClientDir %>/js/CoolingPipelineManager.js',
        '<%= srcITClientDir %>/js/toolbar/RightToolBar.js',
        '<%= srcITClientDir %>/js/DCLabelManager.js',
        '<%= srcITClientDir %>/js/picker/DataPicker.js',
        '<%= srcITClientDir %>/js/load/LoadConfig.js',
        '<%= srcITClientDir %>/js/animate/AlarmAnimateManager.js',
        '<%= srcITClientDir %>/js/seat/SeatManager.js',
        '<%= srcITClientDir %>/js/fpsMode/FPSInteraction.js',
        '<%= srcITClientDir %>/js/fpsMode/ModeChange.js',
        '<%= srcITClientDir %>/js/toolbar/FPSButton.js',
        '<%= srcITClientDir %>/js/HTMLUtil.js',
        '<%= srcITClientDir %>/js/earth/CloudManager.js',
        '<%= srcITClientDir %>/js/earth/eutils.js',
        '<%= srcITClientDir %>/js/earth/map.js',
        '<%= srcITClientDir %>/js/earth/AreaDcBoard.js',
        '<%= srcITClientDir %>/js/earth/AreaScene.js',
        '<%= srcITClientDir %>/js/earth/NationalScene.js',
        '<%= srcITClientDir %>/js/earth/EarthScene.js',
        '<%= srcITClientDir %>/js/earth/EarthSceneView.js',
        '<%= srcITClientDir %>/js/earth/EarthMap.js',
        '<%= srcITClientDir %>/js/earth/DefaultEarthScene.js',
        '<%= srcITClientDir %>/js/earth/CustomEarthSceneView.js',
        '<%= srcITClientDir %>/js/link/LinkDialog.js',
        '<%= srcITClientDir %>/js/earth/DefaultEarthScene.js',
        '<%= srcITClientDir %>/js/fs/FileView.js',
        '<%= srcITClientDir %>/js/Main.js',
        '<%= srcITClientDir %>/js/_end.js',
    ]);

    grunt.config('concat.itv-client', {
        src: [
            '<%= itvClientFiles %>'
        ],
        dest: '<%= srcITClientDir %>js/compress/itv-client.js'
    });

    grunt.config('allSDK', [
        '<%= srcITClientDir %>/libs/twaver.js',
        '<%= srcITClientDir %>/libs/t.js',
        //        '<%= srcITClientDir %>/libs/mono_toolkits.js',
        // '<%= srcITClientDir %>/libs/twaver-make.js',
        '<%= srcITClientDir %>/libs/twaver-doodle.js',
        '<%= srcITClientDir %>/libs/itv-all-min.js',
    ]);

    grunt.config('concat.core', {
        src: [
            '<%= allSDK %>'
        ],
        dest: '<%= srcITClientDir %>libs/core-twaver.js'
    });


    grunt.config('uglify', {
        T: {
            src: '<%= srcITClientDir %>libs/t.js',
            dest: '<%= destTClientDir %>libs/t.js'
        },
        tmake: {
            src: '<%= srcITClientDir %>libs/core-twaver.js',
            dest: '<%= destTClientDir %>libs/core-twaver.js'
        },

        itvmake: {
            src: '<%= srcITClientDir %>libs/twaver-make.js',
            dest: '<%= destTClientDir %>libs/twaver-make.js'
        },
        base: {
            src: '<%= srcITDir %>/script/router/base.js',
            dest: '<%= destITDir %>/script/router/base.js'
        },
        uploadFile: {
            src: '<%= srcITDir %>/script/uploadFile.js',
            dest: '<%= destITDir %>/script/uploadFile.js'
        },
        app: {
            src: '<%= srcITDir %>/script/app.js',
            dest: '<%= destITDir %>/script/app.js'
        },
        // editor:{
        //     src: '<%= srcITClientDir %>libs/com-editor.js',
        //     dest: '<%= destTClientDir %>libs/com-editor.js'
        // },

        //     itvadmin : {
        //      src: '<%= srcITClientDir %>admin/js/compress/itv-admin.js',
        //      dest: '<%= srcITClientDir %>admin/js/compress/itv-admin-min.js'
        //     },

        itvclient: {
            src: '<%= srcITClientDir %>js/compress/itv-client.js',
            dest: '<%= srcITClientDir %>js/compress/itv-client-min.js'
        },

        category: {
            src: '<%= srcITDir %>/script/orm/Category.js',
            dest: '<%= destITDir %>/script/orm/Category.js'
        },
        coloumModel: {
            src: '<%= srcITDir %>/script/orm/ColumnModel.js',
            dest: '<%= destITDir %>/script/orm/ColumnModel.js'
        },
        customModel: {
            src: '<%= srcITDir %>/script/orm/CustomModel.js',
            dest: '<%= destITDir %>/script/orm/CustomModel.js'
        },
        data: {
            src: '<%= destITDir %>/script/orm/Data.js', //注意：因为这个data.js中间有一次格式转换
            dest: '<%= destITDir %>/script/orm/Data.js'
        },
        datatype: {
            src: '<%= srcITDir %>/script/orm/DataType.js',
            dest: '<%= destITDir %>/script/orm/DataType.js'
        },
        businesstype: {
            src: '<%= srcITDir %>/script/orm/BusinessType.js',
            dest: '<%= destITDir %>/script/orm/BusinessType.js'
        },
        model: {
            src: '<%= srcITDir %>/script/orm/Model.js',
            dest: '<%= destITDir %>/script/orm/Model.js'
        },
        modelmanager: {
            src: '<%= srcITDir %>/script/orm/ModelManager.js',
            dest: '<%= destITDir %>/script/orm/ModelManager.js'
        },
        tablemodel: {
            src: '<%= srcITDir %>/script/orm/TableModel.js',
            dest: '<%= destITDir %>/script/orm/TableModel.js'
        },
        filter: {
            src: '<%= srcITDir %>/script/orm/Filter.js',
            dest: '<%= destITDir %>/script/orm/Filter.js'
        },
        popup: {
            src: '<%= srcITDir %>/script/orm/Popup.js',
            dest: '<%= destITDir %>/script/orm/Popup.js'
        },
         preOccupied: {
            src: '<%= srcITDir %>/script/orm/PreOccupied.js',
            dest: '<%= destITDir %>/script/orm/PreOccupied.js'
        },
           port: {
            src: '<%= srcITDir %>/script/orm/Port.js',
            dest: '<%= destITDir %>/script/orm/Port.js'
        },
        scene: {
            src: '<%= srcITDir %>/script/orm/Scene.js',
            dest: '<%= destITDir %>/script/orm/Scene.js'
        },
        tooltip: {
            src: '<%= srcITDir %>/script/orm/Tooltip.js',
            dest: '<%= destITDir %>/script/orm/Tooltip.js'
        },
        // link: {
        //     src: '<%= srcITDir %>/script/orm/Link.js',
        //     dest: '<%= destITDir %>/script/orm/Link.js'
        // },
        templateData: {
            src: '<%= srcITDir %>/script/orm/TemplateData.js',
            dest: '<%= destITDir %>/script/orm/TemplateData.js'
        },
        rightMenuItem: {
            src: '<%= srcITDir %>/script/orm/RightMenuItem.js',
            dest: '<%= destITDir %>/script/orm/RightMenuItem.js'
        },
        temperatureField: {
            src: '<%= srcITDir %>/script/orm/TemperatureField.js',
            dest: '<%= destITDir %>/script/orm/TemperatureField.js'
        },
        alarmType: {
            src: '<%= srcITDir %>/script/orm/AlarmType.js',
            dest: '<%= destITDir %>/script/orm/AlarmType.js'
        },
        //  alarmType: {
        //     src: '<%= srcITDir %>/script/orm/AlarmType.js',
        //     dest: '<%= destITDir %>/script/orm/AlarmType.js'
        // },
        alarm: {
            src: '<%= srcITDir %>/script/orm/Alarm.js',
            dest: '<%= destITDir %>/script/orm/Alarm.js'
        },
        alarmLog: {
            src: '<%= srcITDir %>/script/orm/AlarmLog.js',
            dest: '<%= destITDir %>/script/orm/AlarmLog.js'
        },
        collector: {
            src: '<%= srcITDir %>/script/orm/Collector.js',
            dest: '<%= destITDir %>/script/orm/Collector.js'
        },
        camera: {
            src: '<%= srcITDir %>/script/orm/Camera.js',
            dest: '<%= destITDir %>/script/orm/Camera.js'
        },
        user: {
            src: '<%= srcITDir %>/script/orm/User.js',
            dest: '<%= destITDir %>/script/orm/User.js'
        },
        waterLeakWire: {
            src: '<%= srcITDir %>/script/orm/WaterLeakWire.js',
            dest: '<%= destITDir %>/script/orm/WaterLeakWire.js'
        },
        cctv: {
            src: '<%= srcITDir %>/script/orm/cctv.js',
            dest: '<%= destITDir %>/script/orm/cctv.js'
        },
        initData: {
            src: '<%= srcITDir %>/script/orm/InitData.js',
            dest: '<%= destITDir %>/script/orm/InitData.js'
        },
        config: {
            src: '<%= srcITDir %>/script/orm/Config.js',
            dest: '<%= destITDir %>/script/orm/Config.js'
        },
        routingInspection: {
            src: '<%= srcITDir %>/script/orm/RoutingInspection.js',
            dest: '<%= destITDir %>/script/orm/RoutingInspection.js'
        },
        tool: {
            src: '<%= srcITDir %>/script/orm/Tool.js',
            dest: '<%= destITDir %>/script/orm/Tool.js'
        },
        boProperty: {
            src: '<%= srcITDir %>/script/orm/BOProperty.js',
            dest: '<%= destITDir %>/script/orm/BOProperty.js'
        },
        businessObject: {
            src: '<%= srcITDir %>/script/orm/BusinessObject.js',
            dest: '<%= destITDir %>/script/orm/BusinessObject.js'
        },
        relation: {
            src: '<%= srcITDir %>/script/orm/Relation.js',
            dest: '<%= destITDir %>/script/orm/Relation.js'
        },
        operationLog: {
            src: '<%= srcITDir %>/script/orm/OperationLog.js',
            dest: '<%= destITDir %>/script/orm/OperationLog.js'
        },
        initDataDevicePanel: {
            src: '<%= srcITDir %>/script/orm/InitData_DevicePanel.js',
            dest: '<%= destITDir %>/script/orm/InitData_DevicePanel.js'
        },
        resource: {
            src: '<%= srcITDir %>/script/orm/Resource.js',
            dest: '<%= destITDir %>/script/orm/Resource.js'
        },
        resourceRelation: {
            src: '<%= srcITDir %>/script/orm/ResourceRelation.js',
            dest: '<%= destITDir %>/script/orm/ResourceRelation.js'
        },
        channel: {
            src: '<%= srcITDir %>/script/orm/Channel.js',
            dest: '<%= destITDir %>/script/orm/Channel.js'
        },
        protocol: {
            src: '<%= srcITDir %>/script/orm/Protocol.js',
            dest: '<%= destITDir %>/script/orm/Protocol.js'
        },
        communication: {
            src: '<%= srcITDir %>/script/orm/Communication.js',
            dest: '<%= destITDir %>/script/orm/Communication.js'
        },
        inspectionPath: {
            src: '<%= srcITDir %>/script/orm/InspectionPath.js',
            dest: '<%= destITDir %>/script/orm/InspectionPath.js'
        },
        inspectionPoint: {
            src: '<%= srcITDir %>/script/orm/InspectionPoint.js',
            dest: '<%= destITDir %>/script/orm/InspectionPoint.js'
        },
        inspectionProperty: {
            src: '<%= srcITDir %>/script/orm/InspectionProperty.js',
            dest: '<%= destITDir %>/script/orm/InspectionProperty.js'
        },
        inspectionReport: {
            src: '<%= srcITDir %>/script/orm/InspectionReport.js',
            dest: '<%= destITDir %>/script/orm/InspectionReport.js'
        },
         itConfigurationItem: {
            src: '<%= srcITDir %>/script/orm/ITConfigurationItem.js',
            dest: '<%= destITDir %>/script/orm/ITConfigurationItem.js'
        },
          itConfigurationItemCateory: {
            src: '<%= srcITDir %>/script/orm/ITConfigurationItemCateory.js',
            dest: '<%= destITDir %>/script/orm/ITConfigurationItemCateory.js'
        },
         itConfigurationItemLayer: {
            src: '<%= srcITDir %>/script/orm/ITConfigurationItemLayer.js',
            dest: '<%= destITDir %>/script/orm/ITConfigurationItemLayer.js'
        },
         itCustomColumn: {
            src: '<%= srcITDir %>/script/orm/ITCustomColumn.js',
            dest: '<%= destITDir %>/script/orm/ITCustomColumn.js'
        },
         itCustomTable: {
            src: '<%= srcITDir %>/script/orm/ITCustomTable.js',
            dest: '<%= destITDir %>/script/orm/ITCustomTable.js'
        },
         itLayer: {
            src: '<%= srcITDir %>/script/orm/ITLayer.js',
            dest: '<%= destITDir %>/script/orm/ITLayer.js'
        },
         itRelation: {
            src: '<%= srcITDir %>/script/orm/ITRelation.js',
            dest: '<%= destITDir %>/script/orm/ITRelation.js'
        },
        itRelationType: {
            src: '<%= srcITDir %>/script/orm/ITRelationType.js',
            dest: '<%= destITDir %>/script/orm/ITRelationType.js'
        },
        inspectionData: {
            src: '<%= srcITDir %>/script/orm/InspectionData.js',
            dest: '<%= destITDir %>/script/orm/InspectionData.js'
        },
        inspectionArea: {
            src: '<%= srcITDir %>/script/orm/InspectionArea.js',
            dest: '<%= destITDir %>/script/orm/InspectionArea.js'
        },
        light: {
            src: '<%= srcITDir %>/script/orm/Light.js',
            dest: '<%= destITDir %>/script/orm/Light.js'
        },
        cameraAnimate: {
            src: '<%= srcITDir %>/script/orm/CameraAnimate.js',
            dest: '<%= destITDir %>/script/orm/CameraAnimate.js'
        },
        cameraAnimateAction: {
            src: '<%= srcITDir %>/script/orm/CameraAnimateAction.js',
            dest: '<%= destITDir %>/script/orm/CameraAnimateAction.js'
        },
        downData: {
            src: '<%= srcITDir %>/script/orm/DownData.js',
            dest: '<%= destITDir %>/script/orm/DownData.js'
        },
        coolingPipeline: {
            src: '<%= srcITDir %>/script/orm/CoolingPipeline.js',
            dest: '<%= destITDir %>/script/orm/CoolingPipeline.js'
        },
        virtualDevice: {
            src: '<%= srcITDir %>/script/orm/VirtualDevice.js',
            dest: '<%= destITDir %>/script/orm/VirtualDevice.js'
        },
        alarmSeverity: {
            src: '<%= srcITDir %>/script/orm/AlarmSeverity.js',
            dest: '<%= destITDir %>/script/orm/AlarmSeverity.js'
        },
        alarmStatus: {
            src: '<%= srcITDir %>/script/orm/AlarmStatus.js',
            dest: '<%= destITDir %>/script/orm/AlarmStatus.js'
        },
        customMenu: {
            src: '<%= srcITDir %>/script/orm/CustomMenu.js',
            dest: '<%= destITDir %>/script/orm/CustomMenu.js'
        },
        scheduleTask: {
            src: '<%= srcITDir %>/script/orm/ScheduleTask.js',
            dest: '<%= destITDir %>/script/orm/ScheduleTask.js'
        },
        pdfInfo: {
            src: '<%= srcITDir %>/script/orm/PDFInfo.js',
            dest: '<%= destITDir %>/script/orm/PDFInfo.js'
        },
        eventInstance: {
            src: '<%= srcITDir %>/script/orm/EventInstance.js',
            dest: '<%= destITDir %>/script/orm/EventInstance.js'
        },
        assetDoc: {
            src: '<%= srcITDir %>/script/orm/AssetDoc.js',
            dest: '<%= destITDir %>/script/orm/AssetDoc.js'
        },
        eventClass: {
            src: '<%= srcITDir %>/script/orm/EventClass.js',
            dest: '<%= destITDir %>/script/orm/EventClass.js'
        },
        pdfPath: {
            src: '<%= srcITDir %>/script/orm/pdfPath.js',
            dest: '<%= destITDir %>/script/orm/pdfPath.js'
        },
        TempAsset: {
            src: '<%= srcITDir %>/script/orm/TempAsset.js',
            dest: '<%= destITDir %>/script/orm/TempAsset.js'
        },
         action: {
            src: '<%= srcITDir %>/script/orm/Action.js',
            dest: '<%= destITDir %>/script/orm/Action.js'
        },
         cameraGroup: {
            src: '<%= srcITDir %>/script/orm/CameraGroup.js',
            dest: '<%= destITDir %>/script/orm/CameraGroup.js'
        },
        cameraView: {
            src: '<%= srcITDir %>/script/orm/CameraView.js',
            dest: '<%= destITDir %>/script/orm/CameraView.js'
        },
         iTAlarm: {
            src: '<%= srcITDir %>/script/orm/ITAlarm.js',
            dest: '<%= destITDir %>/script/orm/ITAlarm.js'
        },
         menu: {
            src: '<%= srcITDir %>/script/orm/Menu.js',
            dest: '<%= destITDir %>/script/orm/Menu.js'
        },
         panoramic: {
            src: '<%= srcITDir %>/script/orm/Panoramic.js',
            dest: '<%= destITDir %>/script/orm/Panoramic.js'
        },
           permission: {
            src: '<%= srcITDir %>/script/orm/Permission.js',
            dest: '<%= destITDir %>/script/orm/Permission.js'
        },
            role: {
            src: '<%= srcITDir %>/script/orm/Role.js',
            dest: '<%= destITDir %>/script/orm/Role.js'
        },
             groupOfCamera: {
            src: '<%= srcITDir %>/script/orm/GroupOfCamera.js',
            dest: '<%= destITDir %>/script/orm/GroupOfCamera.js'
        },
             roleOfAsset: {
            src: '<%= srcITDir %>/script/orm/RoleOfAsset.js',
            dest: '<%= destITDir %>/script/orm/RoleOfAsset.js'
        },
            roleOfPermission: {
            src: '<%= srcITDir %>/script/orm/RoleOfPermission.js',
            dest: '<%= destITDir %>/script/orm/RoleOfPermission.js'
        },
             userOfRole: {
            src: '<%= srcITDir %>/script/orm/UserOfRole.js',
            dest: '<%= destITDir %>/script/orm/UserOfRole.js'
        },
        cron: {
            src: '<%= srcITDir %>/script/cron.js',
            dest: '<%= destITDir %>/script/cron.js'
        },
        csrf: {
            src: '<%= srcITDir %>/script/csrf.js',
            dest: '<%= destITDir %>/script/csrf.js',
        },
        handler: {
            src: '<%= srcITDir %>/script/handler.js',
            dest: '<%= destITDir %>/script/handler.js',
        },
        // index: {
        //     src: '<%= srcITDir %>/script/index.js',
        //     dest: '<%= destITDir %>/script/index.js',
        // },
        request: {
            src: '<%= srcITDir %>/script/request.js',
            dest: '<%= destITDir %>/script/request.js',
        },
        generator: {
            src: '<%= srcITDir %>/script/generator.js',
            dest: '<%= destITDir %>/script/generator.js'
        },
        util: {
            src: '<%= destITDir %>/script/util.js',
            dest: '<%= destITDir %>/script/util.js'
        },
        //   util: {
        //     src: '<%= destITDir %>/script/util.js',
        //     dest: '<%= destITDir %>/script/util.js'
        // },
        //     asset : {
        //        files: [{
        //          expand: true,
        //          cwd: '<%= destITDir %>/script/modules/asset/',
        //          src: '*.js',
        //          dest: '<%= destITDir %>/script/modules/asset/'
        //      }]
        //     },
    });


    grunt.config('jshint.IT', {
        options: {
            curly: true,
            // eqeqeq: true,
            immed: true,
            latedef: true,
            newcap: true,
            noarg: true,
            sub: true,
            undef: true,
            unused: true,
            boss: true,
            eqnull: true,
            node: true,
            es5: true
        },
        files: {
            src: [
                '<%= srcITClientDir %>js/compress/it.js'
            ],
        }
    });

    grunt.config('sftp.it', {
        files: {
            // "./node_modules/": "ITV-Release/node_modules/**",
            // "./private/": "ITV-Release/private/**",
            "./public/": "ITV-Release/app/**",
            "./public/": "ITV-Release/public/**",
            "./script/": "ITV-Release/script/**",
            "./upload/": "ITV-Release/upload/**",
            "./*.*": "ITV-Release/*.*"
        },
        options: {
            path: '/home/3ddatacenter',
            host: '<%= secret.host %>',
            username: '<%= secret.username %>',
            password: '<%= secret.password %>',
            showProgress: true,
            srcBasePath: 'ITV-Release/',
            createDirectories: true
        }
    });

    grunt.config('node_optimize', {
        dist: {
            options: {
                ignore: [
                    '<%= destITDir %>/script/config.js',
                    '<%= destITDir %>/node_modules/**'
                ]
            },
            files: {
                '<%= destITDir %>/script/index.optimized.js': '<%= destITDir %>/script/index.js'
            }
        }
    });

    grunt.config('sshexec.it', {
        command: 'cd /home/it/ITV;ls -la;mysql -e "use it;show databases" -uroot -p103360145 ',
        options: {
            host: '<%= secret.host %>',
            username: '<%= secret.username %>',
            password: '<%= secret.password %>'
        }
    });

    grunt.config('regenerator', {
        options: {
            includeRuntime: false
        },
        dist: {
            files: {
                '<%= destITDir %>/script/orm/Data.js': '<%= srcITDir %>/script/orm/Data.js',
                '<%= destITDir %>/script/util.js': '<%= srcITDir %>/script/util.js',
                '<%= destITDir %>/script/login.js': '<%= srcITDir %>/script/login.js',
                //          '<%= destITDir %>/script/base.js' : '<%= srcITDir %>/script/base.js',
                //          '<%= destITDir %>/script/modules/asset/alarm.js' : '<%= destITDir %>/script/modules/asset/alarm.js',
                //          '<%= destITDir %>/script/modules/asset/alarm_log.js' : '<%= destITDir %>/script/modules/asset/alarm_log.js',
                //          '<%= destITDir %>/script/modules/asset/alarm_type.js' : '<%= destITDir %>/script/modules/asset/alarm_type.js',
                //          '<%= destITDir %>/script/modules/asset/asset.js' : '<%= destITDir %>/script/modules/asset/asset.js',
                //          '<%= destITDir %>/script/modules/asset/asset_info.js' : '<%= destITDir %>/script/modules/asset/asset_info.js',
                //          '<%= destITDir %>/script/modules/asset/asset_ip.js' : '<%= destITDir %>/script/modules/asset/asset_ip.js',
                //          '<%= destITDir %>/script/modules/asset/asset_log.js' : '<%= destITDir %>/script/modules/asset/asset_log.js',
                //          '<%= destITDir %>/script/modules/asset/asset_move_recode.js' : '<%= destITDir %>/script/modules/asset/asset_move_recode.js',
                //          '<%= destITDir %>/script/modules/asset/asset_query.js' : '<%= destITDir %>/script/modules/asset/asset_query.js',
                //          '<%= destITDir %>/script/modules/asset/asset_type.js' : '<%= destITDir %>/script/modules/asset/asset_type.js',
                //          '<%= destITDir %>/script/modules/asset/building.js' : '<%= destITDir %>/script/modules/asset/building.js',
                //          '<%= destITDir %>/script/modules/asset/asset_remove.js' : '<%= destITDir %>/script/modules/asset/asset_remove.js',
                //          '<%= destITDir %>/script/modules/asset/asset_query_equipment.js' : '<%= destITDir %>/script/modules/asset/asset_query_equipment.js',
                //          '<%= destITDir %>/script/modules/asset/ac.js' : '<%= destITDir %>/script/modules/asset/ac.js',
                //          '<%= destITDir %>/script/modules/asset/power_rack_ip.js' : '<%= destITDir %>/script/modules/asset/power_rack_ip.js',
                //          '<%= destITDir %>/script/modules/asset/dev_move_out_ip.js' : '<%= destITDir %>/script/modules/asset/dev_move_out_ip.js',
                //          '<%= destITDir %>/script/modules/asset/air_condition_info.js' : '<%= destITDir %>/script/modules/asset/air_condition_info.js',
                //          '<%= destITDir %>/script/modules/asset/ups_info.js' : '<%= destITDir %>/script/modules/asset/ups_info.js',
                //          '<%= destITDir %>/script/modules/asset/storage_battery_info.js' : '<%= destITDir %>/script/modules/asset/storage_battery_info.js',
                //          '<%= destITDir %>/script/modules/asset/rackheader_info.js' : '<%= destITDir %>/script/modules/asset/rackheader_info.js',
                //          '<%= destITDir %>/script/modules/asset/alternator_info.js' : '<%= destITDir %>/script/modules/asset/alternator_info.js',
                //          '<%= destITDir %>/script/modules/asset/integrate_control.js' : '<%= destITDir %>/script/modules/asset/integrate_control.js',
            }
        },
    });


    grunt.registerTask('genIT', [
        'regenerator'
    ]);
    // grunt.registerTask('uglifyScript',['uglify:cron','uglify:base','uglify:handler',,'uglify:util']); 不能

    grunt.registerTask('uglifyScript', ['uglify:category', 'uglify:coloumModel', 'uglify:customModel', 'uglify:data',
        'uglify:itvmake', //make不合并
        'uglify:datatype', 'uglify:model', 'uglify:modelmanager', 'uglify:tablemodel', 'uglify:filter', 'uglify:popup', 'uglify:tooltip',
        'uglify:port','uglify:preOccupied',
        'uglify:templateData', 'uglify:scene', 'uglify:rightMenuItem',
        'uglify:temperatureField', 'uglify:collector', 'uglify:user', 'uglify:waterLeakWire', 'uglify:cctv', 'uglify:initData',
        'uglify:config', 'uglify:routingInspection', 'uglify:tool', 'uglify:boProperty', 'uglify:businessObject', 'uglify:relation',
        'uglify:alarmType', 'uglify:alarm', 'uglify:alarmLog', 'uglify:camera', 'uglify:operationLog', 'uglify:initDataDevicePanel',
        'uglify:cron', 'uglify:csrf', 'uglify:handler',
        // 'uglify:index', 
        'uglify:request', 'uglify:resource', 'uglify:resourceRelation',
        'uglify:channel', 'uglify:communication', 'uglify:protocol', 'uglify:inspectionPath', 'uglify:inspectionPoint',
        'uglify:inspectionProperty', 'uglify:inspectionReport','uglify:itConfigurationItem',
        'uglify:itConfigurationItemCateory',
        'uglify:itConfigurationItemLayer',
        'uglify:itCustomColumn',
        'uglify:itCustomTable',
        'uglify:itLayer',
        'uglify:itRelation',
        'uglify:itRelationType',
         'uglify:inspectionData', 'uglify:inspectionArea', 'uglify:light',
        'uglify:cameraAnimate', 'uglify:cameraAnimateAction', 'uglify:downData', 'uglify:coolingPipeline', 'uglify:virtualDevice',
        'uglify:businesstype', 'uglify:alarmSeverity', 'uglify:alarmStatus', 'uglify:customMenu', 'uglify:scheduleTask', 'uglify:pdfInfo',
        'uglify:eventInstance', 'uglify:eventClass', 'uglify:TempAsset', 'uglify:assetDoc',
        'uglify:generator',
      'uglify:action',
      'uglify:cameraGroup',
      'uglify:cameraView',
      // 'uglify:function',
      'uglify:groupOfCamera',
      'uglify:iTAlarm',
      'uglify:menu',
      'uglify:panoramic',
      'uglify:permission',
      'uglify:role',
      'uglify:roleOfAsset',
      'uglify:roleOfPermission',
      'uglify:userOfRole'
      


    ]); //,'uglify:util'
    //  grunt.registerTask('uglifyGen',['uglify:base','uglify:util','uglify:asset']);
    grunt.registerTask('uglifyGen', ['uglify:tmake']); //,'uglify:T' tmake include T  // remove'uglify:editor',

    //  grunt.registerTask('uglifyRealtime',['uglify:realtime',]);

    //  grunt.registerTask('default',['concat:IT','uglify:IT']);
    grunt.registerTask('default', ['concat:itv-client', 'uglify:itvclient', 'concat:core']); //'concat:itv-admin','uglify:itvadmin','uglify:T'
    grunt.registerTask('cleanAll', ['clean:all']);

    grunt.registerTask('replaceHTML', ['replace:index', 'replace:admin', 'replace:data', 'replace:datatype', 'replace:deveditor', 'replace:scene',
        'replace:app', 'replace:floor', 'replace:rack', 'replace:second', 'replace:third', 'replace:rackEditor'
    ]);
    grunt.registerTask('replaceOnline', ['replace:online1', 'replace:online2']);
    grunt.registerTask('replacePublish', ['replace:publish']);
    grunt.registerTask('copyIT', ['copy:itv']);
     grunt.registerTask('copyTest', ['copy:test']);
    grunt.registerTask('cleanIT', ['clean:itvclient', 'clean:itvclient2', 'clean:orm', 'clean:twaver', 'clean:customer', 'clean:testhtml']); //,'clean:itvadmin','clean:itvadmin2'
    grunt.registerTask('sftpIT', ['sftp:it']);
    grunt.registerTask('execIT', ['sshexec:it'], function(arg) {
        grunt.verbose.write("fdasfadsfdsa");
        console.log("fdsafs");
    });

    grunt.registerTask('nodeMerge', ['node_optimize:dist']);

    // grunt.registerTask('jshintIT',['jshint:IT']);
    grunt.registerTask('it', ['default', 'copyIT', 'replaceHTML', 'cleanIT', 'uglifyScript', 'uglifyRealtime', 'genIT', 'uglifyGen']);
    // grunt.registerTask('it_upload',['default','copyIT','replaceHTML','cleanIT','uglifyScript','uglifyRealtime','genIT','uglifyGen'])

    grunt.registerTask('publish', ['replacePublish']);
    grunt.registerTask('upload', ['replaceOnline', 'sftpIT']);
    grunt.registerTask('itv', ['default', 'copyIT','replaceHTML', 'cleanIT', 'genIT', 'uglifyScript', 'uglifyGen','copyTest']);
};