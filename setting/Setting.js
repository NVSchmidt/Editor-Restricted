///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2017 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    'dojo/_base/declare',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/BaseWidgetSetting',
    'jimu/dijit/SimpleTable',
    'jimu/LayerInfos/LayerInfos',
    'jimu/dijit/LoadingIndicator',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/on',
    'dojo/_base/array',
    'dojo/promise/all',
    "./EditFields",
    "../utils",
    'dijit/form/NumberSpinner',
	'jimu/loaderplugins/jquery-loader!https://code.jquery.com/jquery-1.11.2.min.js',
	"dojo/Deferred"
  ],
  function(
    declare,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,
    Table,
    LayerInfos,
    LoadingIndicator,
    lang,
    html,
    on,
    array,
    all,
    EditFields,
    editUtils,
	$,
	Deferred) {
	var allUsers;
	var currentWindow;
	var table;	
	var save;
	var notChecked = true;
	var outUsers = [];
	var outFinal = [];
	var notDone = true;
	var outJSON;
	var bestJSON = {
		
		"users": {"Fred": "Wilma"},
		
	};
	var bestJsonMade = false;
	var rowData = {
		"title": ["Can edit", "Username", "User"],
		"data": []
	}
	
	saveChanges = function(){
		if(notDone){
				if(document.getElementById("user-table") !== undefined){
					table = document.getElementById("user-table");
				}

				if(table !== undefined && notChecked){
					checkboxes = table.querySelectorAll('.cb');
					notChecked = false;
				}
				
				for(i = 0; i < checkboxes.length; i++){
					if(checkboxes[i].checked){
						if(notDone){
				
							if(document.getElementById("user-table") !== undefined){
								table = document.getElementById("user-table");
							}

							if(table !== undefined && notChecked){
								checkboxes = table.querySelectorAll('.cb');
								notChecked = false;
							}
				
							for(i = 0; i < checkboxes.length; i++){
								if(checkboxes[i].checked){
									outUsers.push(i);
								}
							}
						}
					}
				}
			
				outUsers = outUsers.filter(function(item, pos) {
					return outUsers.indexOf(item) == pos;
				})
			
				
				for(i = 0; i < outUsers.length; i++){
					outFinal.push(rowData.data[outUsers[i]][0]);
				}
				
				var outJSON = JSON.stringify(outFinal);
				bestJSON["users"] = JSON.parse(outJSON);
				currentWindow.getConfig();
				notDone = false;
				alert("Your configuration changes have been saved for this widget. Make sure to save the application as well.");
			}
	}
	
	function getHTMLTable(){
		outstr = "<td style=\"padding-right:5px\"><strong>" + rowData.title[0] + "</strong></td><td><strong>" + rowData.title[1]+ "</strong></td><td><strong>" + rowData.title[2]+"</strong></td></strong>"
		for(i = 0; i < rowData.data.length; i++){
			outstr += "<tr><td><input type=\"checkbox\" class=\"cb\" id=\"cb" + Number(i+1) + "\" data-dojo-type=\"jimu/dijit/CheckBox\">&#9;<td>" +  rowData.data[i][0] + "</td><td>" +  rowData.data[i][1] + "</td></tr>";
		}
		
		return outstr;
	}
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
		
		
      //these two properties is defined in the BaseWidget
      baseClass: 'jimu-widget-edit-setting',
      // selectLayer: null,
      // tooltipDialog: null,
      // featurelayers: [],
      // indexLayer: -1,

      _jimuLayerInfos: null,
      _layersTable: null,
      _tablesTable: null,
      _editableLayerInfos: null,
      _editableTableInfos: null,

      startup: function() {
        this.inherited(arguments);
		if(document.getElementById("save-changes") !== undefined){
			var save = document.getElementById("save-changes");
			save.onclick = saveChanges;
		}
        LayerInfos.getInstance(this.map, this.map.itemInfo)
          .then(lang.hitch(this, function(operLayerInfos) {
            this._jimuLayerInfos = operLayerInfos;
            this._init();
            this.setConfig();
          }));
      },
	  
	   postCreate: function() {
		currentWindow = this;
		require(["esri/arcgis/Portal"], function(arcgisPortal) {
			
			//TODO: Put Portal URL Here
			portal = new arcgisPortal.Portal("");
			
			
			portal.signIn()
			.then(function (loggedInUser){
				current_user = loggedInUser;
				portal.queryUsers({q:'username:0* OR 1* OR 2* OR 3* OR 4* OR 5* OR 6* OR 7* OR 8* OR 9* OR A* OR B* OR C* OR D* OR E* OR F* OR G* OR H* OR I* OR J* OR K* OR L* OR M* OR N* OR O* OR P* OR Q* OR R* OR S* OR T* OR U* OR V* OR W* OR X* OR Y* OR Z* OR a* OR b* OR c* OR d* OR e* OR f* OR g* OR h* OR i* OR j* OR k* OR l* OR m* OR n* OR o* OR p* OR q* OR r* OR s* OR t* OR u* OR v* OR w* OR x* OR y* OR z* NOT esri*', num:'999999999'})
				.then(function(users){
					allUsers = users.results;
				})
				.then(function(){
					currentWindow.buildTable();
				});
			});
		});
	 },
	 
	 buildTable: function (){
		outTable = []
		for(i = 0; i < allUsers.length; i++){
			outTable[i] = [allUsers[i]['username'], allUsers[i]['fullName']]
		}
		rowData.data = outTable;
		currentWindow.tbody.innerHTML =  getHTMLTable();
	},

      _init: function() {
        this._initToolbar();
        this._initLayersTable();
        this._initTablesTable();
      },

      _initToolbar: function() {
        this.useFilterEdit.setValue(this.config.editor.useFilterEdit);
        this.toolbarVisible.setValue(this.config.editor.toolbarVisible);
        this.enableUndoRedo.setValue(this.config.editor.enableUndoRedo);
        this.mergeVisible.setValue(this.config.editor.toolbarOptions.mergeVisible);
        this.cutVisible.setValue(this.config.editor.toolbarOptions.cutVisible);
        this.reshapeVisible.setValue(this.config.editor.toolbarOptions.reshapeVisible);
        this.usingSaveButton.setValue(this.config.editor.usingSaveButton);
        this.autoApplyEditWhenGeometryIsMoved.setValue(this.config.editor.autoApplyEditWhenGeometryIsMoved);

        // default value is 15 pixels, compatible with old version app.
        this.snappingTolerance.set('value', this.config.editor.snappingTolerance === undefined ?
                                            15 :
                                            this.config.editor.snappingTolerance);
        // default value is 5 pixels, compatible with old version app.
        this.popupTolerance.set('value', this.config.editor.popupTolerance === undefined ?
                                            5 :
                                            this.config.editor.popupTolerance);

        // default value is 0 pixels, compatible with old version app.
        this.stickyMoveTolerance.set('value', this.config.editor.stickyMoveTolerance === undefined ?
                                            0 :
                                            this.config.editor.stickyMoveTolerance);
      },

      _initLayersTable: function() {
        var fields = [{
          name: 'edit',
          title: this.nls.edit,
          type: 'checkbox',
          'class': 'editable'
        }, {
          name: 'label',
          title: this.nls.label,
          type: 'text'
        }, {
          name: 'disableGeometryUpdate',
          title: this.nls.update,
          type: 'checkbox',
          'class': 'update',
          width: '300px'
        }, {
          name: 'actions',
          title: this.nls.fields,
          type: 'actions',
          'class': 'edit-fields',
          actions: ['edit']
        }];
        var args = {
          fields: fields,
          selectable: false
        };
        this._layersTable = new Table(args);
        this._layersTable.placeAt(this.layerInfosTable);
        this._layersTable.startup();

        this.own(on(this._layersTable,
          'actions-edit',
          lang.hitch(this, this._onEditFieldInfoClick, this._layersTable)));
      },

      _initTablesTable: function() {
        var fields = [{
          name: 'edit',
          title: this.nls.edit,
          type: 'checkbox',
          'class': 'editable'
        }, {
          name: 'label',
          title: window.jimuNls.common.table,
          type: 'text'
        }, {
          name: 'actions',
          title: this.nls.fields,
          type: 'actions',
          'class': 'edit-fields',
          actions: ['edit']
        }];
        var args = {
          fields: fields,
          selectable: false
        };
        this._tablesTable = new Table(args);
        this._tablesTable.placeAt(this.tableInfosTable);
        this._tablesTable.startup();

        this.own(on(this._tablesTable,
          'actions-edit',
          lang.hitch(this, this._onEditFieldInfoClick, this._tablesTable)));
      },

      setConfig: function() {
        // if (!config.editor.layerInfos) { //***************
        //   config.editor.layerInfos = [];
        // }
        this._editableLayerInfos = this._getEditableLayerInfos();
        this._setTable(this._editableLayerInfos, this._layersTable);
        var loading = new LoadingIndicator({hidden: false}).placeAt(this.tableInfosLoading);
        this._getEditableTableInfos().then(lang.hitch(this, function(editableTableInfos) {
          loading.destroy();
          this._editableTableInfos = editableTableInfos;
          if(this._editableTableInfos.length > 0) {
            this._setTable(editableTableInfos, this._tablesTable);
            html.setStyle(this.tableInfosTable, 'display', 'block');
          }
        }));
      },


      _getEditableTableInfos: function() {
        var defs = [];
        var editableTableInfos = [];
        var tableInfoArray = this._jimuLayerInfos.getTableInfoArray();
        array.forEach(tableInfoArray, function(jimuTableInfo) {
          defs.push(jimuTableInfo.getLayerObject());
        }, this);

        return all(defs).then(lang.hitch(this, function() {
          array.forEach(tableInfoArray, function(jimuTableInfo) {
            var tableObject = jimuTableInfo.layerObject;
            var capabilities = jimuTableInfo.getCapabilitiesOfWebMap();
            var isEditableInWebMap;
            if(capabilities && capabilities.toLowerCase().indexOf('editing') === -1) {
              isEditableInWebMap = false;
            } else {
              isEditableInWebMap = true;
            }

            if (tableObject.type === "Table" &&
                tableObject.url &&
                tableObject.isEditable &&// todo...********
                tableObject.isEditable() &&
                isEditableInWebMap) {
              var tableInfo = this._getLayerInfoFromConfiguration(tableObject);
              if(!tableInfo) {
                tableInfo = this._getDefaultLayerInfo(tableObject);
              }
              editableTableInfos.push(tableInfo);
            }
          }, this);
          return editableTableInfos;
        }));
      },


      _getEditableLayerInfos: function() {
        // summary:
        //   get all editable layers from map.
        // description:
        //   layerInfo will honor the configuration if that layer has been configured.
        var editableLayerInfos = [];
        for(var i = this.map.graphicsLayerIds.length - 1; i >= 0; i--) {
          var layerObject = this.map.getLayer(this.map.graphicsLayerIds[i]);
          if (layerObject.type === "Feature Layer" &&
              layerObject.url &&
              layerObject.isEditable &&
              layerObject.isEditable()) {
            var layerInfo = this._getLayerInfoFromConfiguration(layerObject);
            if(!layerInfo) {
              layerInfo = this._getDefaultLayerInfo(layerObject);
            }
            editableLayerInfos.push(layerInfo);
          }
        }
        return editableLayerInfos;
      },

      _getLayerInfoFromConfiguration: function(layerObject) {
        var layerInfo = null;
        var layerInfos = this.config.editor.layerInfos ? this.config.editor.layerInfos : [];
        layerInfos = layerInfos.concat(this.config.editor.tableInfos ?
                                       this.config.editor.tableInfos :
                                       []);
        if(layerInfos && layerInfos.length > 0) {
          for(var i = 0; i < layerInfos.length; i++) {
            if(layerInfos[i].featureLayer &&
               layerInfos[i].featureLayer.id === layerObject.id) {
              layerInfo = layerInfos[i];
              break;
            }
          }

          if(layerInfo) {
            // update fieldInfos.
            layerInfo.fieldInfos = this._getSimpleFieldInfos(layerObject, layerInfo);
            // set _editFlag to true
            layerInfo._editFlag = true;
          }
        }
        return layerInfo;
      },

      _getDefaultLayerInfo: function(layerObject) {
        var configedLayerOrTableInfos = this.config.editor.layerInfos && this.config.editor.tableInfos ?
                                        this.config.editor.layerInfos.concat(this.config.editor.tableInfos):
                                        null;
        var layerInfo = {
          'featureLayer': {
            'id': layerObject.id
          },
          'disableGeometryUpdate': false,
          'fieldInfos': this._getSimpleFieldInfos(layerObject),
          '_editFlag': configedLayerOrTableInfos &&
                        configedLayerOrTableInfos.length === 0 ? true : false
        };
        return layerInfo;
      },

      _setTable: function(layerOrTableInfos, tableDijit) {
        array.forEach(layerOrTableInfos, function(layerInfo) {
          var _jimuLayerInfo = this._jimuLayerInfos.getLayerOrTableInfoById(layerInfo.featureLayer.id);
          var addRowResult = tableDijit.addRow({
            label: _jimuLayerInfo.title,
            edit: layerInfo._editFlag,
            disableGeometryUpdate: layerInfo.disableGeometryUpdate
          });
          addRowResult.tr._layerInfo = layerInfo;

          // var editableCheckBox;
          // var editableCheckBoxDomNode = query(".editable .jimu-checkbox", addRowResult.tr)[0];
          // if(editableCheckBoxDomNode) {
          //   editableCheckBox = registry.byNode(editableCheckBoxDomNode);
          //   // this.own(on(editableCheckBox,
          //   // 'change',
          //   // lang.hitch(this, function() {
          //   //   console.log(layerInfo.id);
          //   // })));
          //   editableCheckBox.onChange = lang.hitch(this, function(checked) {
          //     layerInfo._editFlag = checked;
          //   });
          // }
        }, this);
      },

      // about fieldInfos mehtods.
      _getDefaultSimpleFieldInfos: function(layerObject) {
        var fieldInfos = [];
        var isEditable;
        var visible;
        for (var i = 0; i < layerObject.fields.length; i++) {
          isEditable = !layerObject.fields[i].editable ?
                        null :
                        true;
          visible = (layerObject.fields[i].name.toLowerCase() === "globalid" ||
                    layerObject.fields[i].name === layerObject.objectIdField) &&
                    !layerObject.fields[i].editable ?
                    false:
                    true;

          fieldInfos.push({
            fieldName: layerObject.fields[i].name,
            label: layerObject.fields[i].alias || layerObject.fields[i].name,
            isEditable: isEditable,
            visible: (visible || isEditable) ? true : false // isEditable probably is null
          });
        }
        return fieldInfos;
      },

      _getWebmapSimpleFieldInfos: function(layerObject) {
        var isEditable;
        var visible;
        var webmapSimpleFieldInfos = [];
        var webmapFieldInfos =
          editUtils.getFieldInfosFromWebmap(layerObject.id, this._jimuLayerInfos);
        if(webmapFieldInfos) {
          array.forEach(webmapFieldInfos, function(webmapFieldInfo) {
            if(webmapFieldInfo.isEditableOnLayer !== undefined &&
               // disable relationship's field.
               editUtils.ignoreCaseToGetFieldKey(layerObject, webmapFieldInfo.fieldName)) {
              isEditable = !webmapFieldInfo.isEditableOnLayer ?
                           null :
                           webmapFieldInfo.isEditable;
              visible = webmapFieldInfo.visible;

              webmapSimpleFieldInfos.push({
                fieldName: webmapFieldInfo.fieldName,
                label: webmapFieldInfo.label,
                isEditable: isEditable,
                visible: (visible || isEditable) ? true : false // isEditable probably is null
              });
            }
          });
          if(webmapSimpleFieldInfos.length === 0) {
            webmapSimpleFieldInfos = null;
          }
        } else {
          webmapSimpleFieldInfos = null;
        }
        return webmapSimpleFieldInfos;
      },

      _getSimpleFieldInfos: function(layerObject, layerInfo) {
        var baseSimpleFieldInfos;
        var simpleFieldInfos = [];
        var defautlSimpleFieldInfos = this._getDefaultSimpleFieldInfos(layerObject);
        var webmapSimpleFieldInfos = this._getWebmapSimpleFieldInfos(layerObject);

        baseSimpleFieldInfos =
          webmapSimpleFieldInfos ? webmapSimpleFieldInfos : defautlSimpleFieldInfos;

        if(layerInfo && layerInfo.fieldInfos) {
          // Edit widget had been configured

          // keep order of config fieldInfos and add new fieldInfos at end.
          array.forEach(layerInfo.fieldInfos, function(configuredFieldInfo) {
            // Compatible with old version fieldInfo that does not defined
            // the visible attribute. Init visible according to webmap field infos.
            if(configuredFieldInfo.visible === undefined) {
              if(webmapSimpleFieldInfos) {
                for(var j = 0; j < webmapSimpleFieldInfos.length; j++) {
                  if(configuredFieldInfo.fieldName === webmapSimpleFieldInfos[j].fieldName) {
                    configuredFieldInfo.visible = webmapSimpleFieldInfos[j].visible ||
                                                  webmapSimpleFieldInfos[j].isEditable;
                  }
                }
                // if configuredFieldInfo.name is not matching any field of webmapSimpleFieldInfos,
                // this configured field will not display in field setting popup.
              } else {
                configuredFieldInfo.visible = true;
              }
            }

            // keep order.
            for(var i = 0; i < baseSimpleFieldInfos.length; i++) {
              if(configuredFieldInfo.fieldName === baseSimpleFieldInfos[i].fieldName) {
                simpleFieldInfos.push(configuredFieldInfo);
                baseSimpleFieldInfos[i]._exit = true;
                break;
              }
            }
          });
          // add new fieldInfos at end.
          array.forEach(baseSimpleFieldInfos, function(baseSimpleFieldInfo) {
            if(!baseSimpleFieldInfo._exit) {
              simpleFieldInfos.push(baseSimpleFieldInfo);
            }
          });
        } else {
          simpleFieldInfos = baseSimpleFieldInfos;
        }
        return simpleFieldInfos;
      },

      _onEditFieldInfoClick: function(table, tr) {
        var rowData = table.getRowData(tr);
        if(rowData && rowData.edit) {
          var editFields = new EditFields({
            nls: this.nls,
            _layerInfo: tr._layerInfo
          });
          editFields.popupEditPage();
        }
      },

      _onToolbarSelected: function() {
        if (this.toolbarVisible.checked) {
          //html.setStyle(this.toolbarOptionsLabel, 'display', 'table-cell');
          //html.setStyle(this.toolbarOptionsTd, 'display', 'table-cell');
          html.removeClass(this.toolbarOptionsTr, 'disable');
          html.setStyle(this.toolbarOptionsCoverage, 'display', 'none');
        } else {
          //html.setStyle(this.toolbarOptionsLabel, 'display', 'none');
          //html.setStyle(this.toolbarOptionsTd, 'display', 'none');
          html.addClass(this.toolbarOptionsTr, 'disable');
          html.setStyle(this.toolbarOptionsCoverage, 'display', 'block');
        }
      },

      _resetToolbarConfig: function() {
        this.config.editor.useFilterEdit = this.useFilterEdit.checked;
        this.config.editor.toolbarVisible = this.toolbarVisible.checked;
        this.config.editor.enableUndoRedo = this.enableUndoRedo.checked;
        this.config.editor.toolbarOptions.mergeVisible = this.mergeVisible.checked;
        this.config.editor.toolbarOptions.cutVisible = this.cutVisible.checked;
        this.config.editor.toolbarOptions.reshapeVisible = this.reshapeVisible.checked;
        this.config.editor.usingSaveButton = this.usingSaveButton.checked;
        this.config.editor.autoApplyEditWhenGeometryIsMoved =
          this.autoApplyEditWhenGeometryIsMoved.checked;
        this.config.editor.snappingTolerance = this.snappingTolerance.value;
        this.config.editor.popupTolerance = this.popupTolerance.value;
        this.config.editor.stickyMoveTolerance = this.stickyMoveTolerance.value;
      },


      _getCheckedLayerOrTableInfos: function(editableLayerOrTableInfos, tableDijit) {
        // get layerInfos or tableInfos config
        var checkedLayerInfos = [];
        var layersTableData =  tableDijit.getData();
        array.forEach(editableLayerOrTableInfos, function(layerInfo, index) {
          layerInfo._editFlag = layersTableData[index].edit;
          layerInfo.disableGeometryUpdate = layersTableData[index].disableGeometryUpdate;
          if(layerInfo._editFlag) {
            delete layerInfo._editFlag;
            checkedLayerInfos.push(layerInfo);
          }
        });
        return checkedLayerInfos;
      },

      getConfig: function() {
        // get toolbar config
        this._resetToolbarConfig();

        /*
        // get layerInfos config
        var checkedLayerInfos = [];
        var layersTableData =  this._layersTable.getData();
        array.forEach(this._editableLayerInfos, function(layerInfo, index) {
          layerInfo._editFlag = layersTableData[index].edit;
          layerInfo.disableGeometryUpdate = layersTableData[index].disableGeometryUpdate;
          if(layerInfo._editFlag) {
            delete layerInfo._editFlag;
            checkedLayerInfos.push(layerInfo);
          }
        });
        */

        // get layerInfos config
        var checkedLayerInfos = this._getCheckedLayerOrTableInfos(this._editableLayerInfos, this._layersTable);
        if(checkedLayerInfos.length === 0) {
          delete this.config.editor.layerInfos;
        } else {
          this.config.editor.layerInfos = checkedLayerInfos;
        }
        // get tableInfos config
        var checkedTableInfos = this._getCheckedLayerOrTableInfos(this._editableTableInfos, this._tablesTable);
        if(checkedTableInfos.length === 0) {
          delete this.config.editor.tableInfos;
        } else {
          this.config.editor.tableInfos = checkedTableInfos;
        }
		
		this.config["users"] = bestJSON.users;

        return this.config;
      }
    });
  });
