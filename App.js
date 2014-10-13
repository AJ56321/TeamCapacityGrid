// IMPORTANT NOTE: If you rebuild this app, you must add "var app;" to the new 
// deploy/App...html files just above "Rally.onReady(function () {"
//
Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'iteration',
	html:'<div title="Capacity records are only created from the Team Status page. Making an initial entry there allows the display and edit here."><h1 style="text-align:left;float:left;">Goto Track->Team Status Page to enter initial Capacities</h1><input type="button" style="text-align:right;float:right;" value="Refresh" onClick="javascript: app._loadGrid();"/></div>',
    comboboxConfig: {
        fieldLabel: 'Select an Iteration:</div>',
        width: 400
    },
	addContent: function() {
		this._showMask('Loading');
		this._loadGrid();
	},
	onScopeChange: function() {
		this._showMask('Updating');
		this._loadGrid();
	},
	_loadGrid: function () {
		var context = this.getContext();
		pageSize = 25;
		fetch = 'User,Capacity,TaskEstimates,Load';
		iOID = this.getContext().getTimeboxScope().getRecord().get("ObjectID");
		if ( this._myGrid ) { this._myGrid.destroy(); }
        this._myGrid = Ext.create("Rally.ui.grid.Grid", {
			xtype: 'rallygrid',
			layout: 'fit',
			enableColumnHide: false,
			showRowActionsColumn: false,
			enableEditing: true,
			context: this.getContext(),
			storeConfig: {
				fetch: fetch,
				model: 'UserIterationCapacity',
				filters: this._getFilters(iOID),
				pageSize: pageSize,
				listeners: {
					datachanged: function() {
//						console.log("datachange");
//						this._loadGrid();
					},
					scope: this
				},
				sorters: [
					{ property: 'User', direction: 'ASC' }
				]
			},
			columnCfgs: [
				{
					text: 'User',
					dataIndex: 'User',
					flex: 1
				},
				{
					text: 'Capacity',
					dataIndex: 'Capacity'
				},
				{
					text: 'Task Estimates',
					dataIndex: 'TaskEstimates'
				},
				{
					text: 'Load',
					xtype: 'templatecolumn',
					tpl: Ext.create('Rally.ui.renderer.template.progressbar.ProgressBarTemplate', {
						percentDoneName: 'Load',
						calculateColorFn: function(recordData) {
							if (recordData.Load < 0.8) {
								colVal = "#B2E3B6"; // Green
							} else if (recordData.Load < 1.0) {
								colVal = "#FBDE98"; // Orange
							} else {
								colVal = "#FCB5B1"; // Red
							}
						return colVal;
						}
					})
				}
			],
			pagingToolbarCfg: {
				pageSizes: [pageSize]
			}
		});
		this._hideMask();
		app = this;
		this.add(this._myGrid);
	},
	_getFilters: function (iName) {
		var filters = [];
		filters.push({
			property: 'Iteration.ObjectID',
			operator: '=',
			value: iName
		});
//		filters.push({
//			property: 'Capacity',
//			operator: '>',
//			value: 0
//		});
		return filters;
	},
	_showMask: function(msg) {
		if ( this.getEl() ) { 
			this.getEl().unmask();
			this.getEl().mask(msg);
		}
	},
	_hideMask: function() {
		this.getEl().unmask();
	}
});