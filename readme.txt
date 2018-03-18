基于原来的后端，修改了模型定义。目前不支持直接使用sql语句。
1.ORM框架使用的技术是sequelize框架和bluebird
2.模型的定义，参照orm/module/table/Table.js
3.模型的目录，根路径在orm/module，如果里面建有子目录，访问时需要加上路径，例如table.Table
4.所有模型有moduleManager负责维护，请参照moduleManager.js上面的注释。
5.所有的模型内存可以在moduleManager.moduleMap中取得
6.内置一个Module模型，记录所有已经加载的模型，可以通过http://localhost:8081/api/Module/find获取所有的模型
8.内置table.Table和table.Column两个模型，用来记录动态添加的模型。
9.每个模型内置一个no属性，moduleManager加载时会按照这个排序，默认是0，所以Module的no值是-1，排在最前面。


v1.0
v1.1
v1.2
v1.3
v1.4
v1.5