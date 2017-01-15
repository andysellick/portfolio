
/* JShint config */
/* globals React, ReactDOM, datasource, LazyLoad */

//do an ajax request
function callAjax(url, callback) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
			callback(xmlhttp.responseText);
		}
	};
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
}

var ClientData = React.createClass({
	getInitialState: function() {
		return {
			projects: [], //this holds all of the projects
			matchingprojects: [], //this holds all of the projects that match the current filter/search state
			visibleprojects: [], //this holds all of the projects that should be shown currently, depending on pagination
			filters: {},
			activeFilters: [],
			globalSelect: 0,
			filterSelect: [],
			resetstatus: 0, //if reset status is 0, reset button is disabled
			mobileHeaderState: '', //controls visibility of mobile menu/search by applying a class
			perpage: 20, //number of items to show per page
			onpage: 0 //current page
		};
	},

	componentDidMount: function() {
		callAjax(this.props.url,this.receiveAjaxRequest);
	},

	//process data received from ajax and set state
	receiveAjaxRequest: function(data, filters){
		data = JSON.parse(data);

		var projdata = [];
		for(var d = 0; d < data.client.length; d++){
			var flag = -1;
			//sort project data by date. If no specific date, concoct a rough one using the year
			if(typeof data.client[d].date === 'undefined'){
				data.client[d].date = data.client[d].filters.year[0] + '/01/01';
			}

			for(var n = 0; n < projdata.length; n++){
				//if(data.client[d].jobname > projdata[n].jobname){ //order alphabetically
				if(data.client[d].date > projdata[n].date){ //order by date of work
					flag = n;
				}
			}

			if(flag === -1){
				projdata.unshift(data.client[d]);
			}
			else {
				projdata.splice(flag + 1, 0, data.client[d]);
			}
		}
		projdata.reverse();
		//insert the sorted project data into the state
		this.setState({	projects: projdata });

		//now use the state projects data to find all the possible filters
		for(var a = 0; a < this.state.projects.length; a++) {
			// loop through projects array and find each object
			for (var key in this.state.projects[a].filters) {
				if(this.state.projects[a].filters[key][0].length){ //only check/insert if the first array value is not an empty string
					for (var b = 0; b < this.state.projects[a].filters[key].length; b++) {
						//if there already exists a filter for whatever this is, e.g. 'client'
						if(this.state.filters.hasOwnProperty(key)) {
							var found = 0;
							//check to see if there is already a filter in this group with this name
							var valtoinsert = this.state.projects[a].filters[key][b].toLowerCase();
							for(var c = 0; c < this.state.filters[key].length; c++) {
								if(this.state.filters[key][c].name === valtoinsert){
									found = 1;
									break;
								}
							}
							//not found, so add it
							if(!found){
								var topush = {'name' : valtoinsert, 'checked' : 0};
								//search through and insert alphabetically
								var flag2 = -1;
								for(var alpha = 0; alpha < this.state.filters[key].length; alpha++){
									if(topush.name > this.state.filters[key][alpha].name){
										flag2 = alpha;
									}
								}
								if(flag2 === -1){
									this.state.filters[key].unshift(topush); //add to the start of the array
								}
								else {
									this.state.filters[key].splice(flag2 + 1,0,topush);
								}
							}
						}
						//this filter does not already exist in the filters list
						else {
							this.state.filters[key] = [];
							this.state.filters[key].push({'name' : this.state.projects[a].filters[key][b].toLowerCase(), 'checked' : 0});
						}
					}
				}
			}
		}

		//insert 'not set' as an actual filter option for each filter
		for(var fkey in this.state.filters){
			this.state.filters[fkey].push({'name': 'not set', 'checked' : 0});
		}
		//insert 'not set' into any blank project data
		for(var proj = 0; proj < this.state.projects.length; proj++) {
			for(var newkey in this.state.filters){
				//if the project does not have a filter called this, or it's been set to [''], set it to 'not set'
				if(!this.state.projects[proj].filters.hasOwnProperty(newkey) || this.state.projects[proj].filters[newkey][0] === ''){
					this.state.projects[proj].filters[newkey] = ['not set'];
				}
				else {
					//lowercase everything in the filters
					for(var lower = 0; lower < this.state.projects[proj].filters[newkey].length; lower++){
						this.state.projects[proj].filters[newkey][lower] = this.state.projects[proj].filters[newkey][lower].toLowerCase();
					}
				}
			}
		}
		this.displayProjects();
		this.forceUpdate();
		//this.checkPageHash();
	},

	//handle the popup windows containing additional info about projects
	showPopup: function(i,job) {
		// check if an element does not have the expanded state on it. If it doesn't add it and if not, leave as is.
		if (this.state.visibleprojects[i].expanded !== true) {
			this.state.visibleprojects[i].expanded = true;
			this.state.visibleprojects[i].jsdropdown = true;
			//this.setLocationHash(job);
		} else{
			this.state.visibleprojects[i].expanded = false;
			//this.setLocationHash('');
		}
		this.forceUpdate();
	},

	//given a job name, set the page hash to it
	//fixme only problem with this is that if the hash is empty, the hash is left as simply '#', which causes the page to jump to the top of the screen, so this is disabled for now
	setLocationHash: function(usehash){
		usehash = usehash.replace(/ /g,'_').replace(/'/g,'');
		location.hash = usehash;
	},

	//on page load, check the hash for what popup we should be showing
	checkPageHash: function(){
		var currhash = location.hash.replace('#','').replace(/_/g,' ');
		var job = '';
		if(currhash.length){
			var found = -1;
			for(var z = 0; z < this.state.projects.length; z++){
				job = this.state.projects[z].jobname;
				job = job.replace(/'/g,'');
				if(job === currhash){
					found = z;
					break;
				}
			}
			if(found !== -1){
				this.showPopup(found,currhash);
			}
		}
	},

	//when a filter checkbox is clicked, set that filter accordingly
	filterByTarget: function (clicked,filtertype){
		this.state.searchtext = '';
		for(var i = 0; i < this.state.filters[filtertype].length; i++){
			if(this.state.filters[filtertype][i].name === clicked){
				if(this.state.filters[filtertype][i].checked === 1){
					this.state.filters[filtertype][i].checked = 0;
				}
				else {
					this.state.filters[filtertype][i].checked = 1;
				}
			}
		}
		var stopLoop = false;

		for (var key2 in this.state.filters) {
			for (var e = 0; e < this.state.filters[key2].length; e++) {
				if (stopLoop === false) {
					if (this.state.filters[key2][e].checked === 0) {
						this.state.globalSelect = 1;
						stopLoop = true;
					} else {
						this.state.globalSelect = 0;
					}
				}
			}
		}
		this.resetPagePosition();
		this.displayProjects();
	},

	//called after filters have changed, updates show/hide status of projects accordingly
	displayProjects: function(){
		this.state.resetstatus = 1;
		this.state.activeFilters = []; //create a temporary array of all active filters
		this.state.visibleprojects = []; //reset the currently shown projects
		this.state.matchingprojects = []; //holds any projects that should be shown, will be filtered shortly to fit the pagination

		for(var key in this.state.filters){
			var obj = {'name': key, vals: []};
			for(var filt = 0; filt < this.state.filters[key].length; filt++){
				if(this.state.filters[key][filt].checked === 1){
					obj.vals.push(this.state.filters[key][filt].name);
				}
			}
			if(obj.vals.length){
				this.state.activeFilters.push(obj);
			}
		}

		if(this.state.activeFilters.length){
			for(var p = 0; p < this.state.projects.length; p++){
				var showproj = 1;
				for(var f = 0; f < this.state.activeFilters.length; f++){
					if(showproj){
						var showsect = 0;
						var findfilter = this.state.activeFilters[f].name;
						for(var thisfilt = 0; thisfilt < this.state.projects[p].filters[findfilter].length; thisfilt++){
							if(this.state.activeFilters[f].vals.indexOf(this.state.projects[p].filters[findfilter][thisfilt]) !== -1){
								showsect = 1;
								break;
							}
						}
						if(showsect){
							showproj = 1;
						}
						else {
							showproj = 0;
						}
					}
				}
				if(showproj){
					this.state.matchingprojects.push(this.state.projects[p]); //this project should be shown, so put it into the list to be shown
				}
			}
			this.paginateVisible();
		}
		else {
			this.state.resetstatus = 0;
			this.showAllProjects();
		}
		this.forceUpdate();
	},

	//do the pagination - only have projects in the visibleprojects state that fall within the current pagination boundaries
	paginateVisible: function(){
		this.state.visibleprojects = [];
		var currstart = this.state.onpage * this.state.perpage;
		var currend = Math.min(currstart + this.state.perpage,this.state.matchingprojects.length);

		for(var g = currstart; g < currend; g++){
			this.state.visibleprojects.push(this.state.matchingprojects[g]);
		}
	},

	//resets everything to default state
	resetAll: function(){
		for(var key in this.state.filters){
			for(var f = 0; f < this.state.filters[key].length; f++){
				this.state.filters[key][f].checked = 0;
			}
		}
		this.resetPagePosition();
		this.showAllProjects();
		this.clearSearch();
		this.state.resetstatus = 0;
	},

	//select all filters within a group, e.g. all clients
	selectAllFilter: function(e){
		this.state.searchtext = '';
		var filter = e.target.name;
		var selectall = 0;
		if(e.target.checked){
			selectall = 1;
		}
		for(var filt = 0; filt < this.state.filters[filter].length; filt++){
			this.state.filters[filter][filt].checked = selectall;
		}
		this.resetPagePosition();
		this.displayProjects();
	},

	//handles text input into the search box
	typeSearch: function(e){
		this.state.resetstatus = 1;
		var typed = e.target.value;
		this.state.searchtext = typed;

		if(typed.length > 2){
			this.displayProjects(); //reset the search to those things found by filters, otherwise bug caused by invalid search that can't be deleted
			this.state.resetstatus = 1;
			this.state.visibleprojects = [];
			var matches = this.state.matchingprojects;
			this.state.matchingprojects = [];

			for(var p = 0; p < matches.length; p++){
				var thisproj = matches[p].jobname + ' ' + matches[p].desc;
				var found = thisproj.toLowerCase().match(typed.toLowerCase());
				if(found){
					this.state.matchingprojects.push(matches[p]);
				}
			}
		}
		else {// if(typed.length === 0){
			this.state.resetstatus = 0;
			this.displayProjects();
		}
		if(typed.length > 0){
			this.state.resetstatus = 1;
		}
		this.resetPagePosition();
		this.paginateVisible();
		this.forceUpdate();
	},

	//clear the contents of the search box
	clearSearch: function(){
		this.state.searchtext = '';
		this.state.resetstatus = 0;
		this.displayProjects();
		this.resetPagePosition();
		this.forceUpdate();
	},

	//show all projects regardless
	showAllProjects: function(){
		this.state.matchingprojects = [];
		for(var p = 0; p < this.state.projects.length; p++){
			this.state.matchingprojects.push(this.state.projects[p]);
		}
		this.paginateVisible();
	},

	//clicking on one of the 'active filters' underneath the menu
	clearfilter: function(e){
		var tofind = e.target.dataset.type;
		//first remove the active filter
		for(var x = 0; x < this.state.activeFilters.length; x++){
			if(this.state.activeFilters[x].name === tofind){
				this.state.activeFilters.splice(x,1);
				break;
			}
		}
		//then reset the individual filters themselves
		for(var filt = 0; filt < this.state.filters[tofind].length; filt++){
			this.state.filters[tofind][filt].checked = 0;
		}
		this.state.searchtext = '';
		this.resetPagePosition();
		this.displayProjects(); //then update the displayed projects
		this.forceUpdate();
	},

	clearMobileMenus: function(){
		this.mobileHeaderState = '';
		this.forceUpdate();
	},
	
	closeSearch: function(){
		this.clearMobileMenus();
		this.clearSearch();
	},

	//bring in the mobile header filter menu using a CSS change, hide the searchbox
	showMobileMenu: function(e){
		if(this.mobileHeaderState === 'showmenu'){
			this.mobileHeaderState = '';
		}
		else {
			this.mobileHeaderState = 'showmenu';
		}
		this.forceUpdate();
	},

	//bring in the mobile header searchbox using a CSS change, hide the filter menu
	showMobileSearch: function(e){
		this.mobileHeaderState = 'showsearch';
		this.forceUpdate();
	},
	
	//given that changing filters could reduce visible results below the current view position, need to reset it
	resetPagePosition: function(){
		this.state.onpage = 0;
	},

	//move position to the next page of results
	nextPage: function(){
		this.state.onpage = Math.min(Math.ceil((this.state.matchingprojects.length / this.state.perpage) - 1),this.state.onpage + 1);
		this.paginateVisible();
		this.forceUpdate();
	},

	//move position to the previous page of results
	prevPage: function(){
		this.state.onpage = Math.max(0,this.state.onpage - 1);
		this.paginateVisible();
		this.forceUpdate();
	},

	render: function() {
		var self = this;
		var filtersObject = this.state.filters;
		var resetdisabled = 'disabled';
		if(this.state.resetstatus === 1){
			resetdisabled = 'btn-primary';
		}

		return (
			<div>
				<header className={this.mobileHeaderState + ' header'}>
					<div className="headerinner">
						<div className="container">
							<span className="mobilemenu mobile-only" onClick={this.showMobileMenu}><img src="static/img/bars.svg"/></span>
						</div>
					</div>
					<nav className="mainmenu">
						<ul className="mainfilters">
							{Object.keys(this.state.filters).map(function(filtertype,i) {
								return(
									<li className="filteritem" key={i}>
										<span className="droptrigger"><span className="droptriggerinner">{filtertype}</span></span>
										<div className="dropcontent">
											{Object.keys(filtersObject[filtertype]).map(function(filter,j){
												var breakon = '';
												//console.log(filtersObject[filtertype].length, filtertype, j,j % Math.ceil(filtersObject[filtertype].length / 4));
												//combined with css flexbox, do clever column sorting layout
												if(j % Math.ceil(filtersObject[filtertype].length / 4) === 0){
													breakon = 'newcolumn';
												}
												var thisFilter = filtersObject[filtertype][filter].name;
												var checked = filtersObject[filtertype][filter];

												if(thisFilter.length){
													return(
														<label className={breakon + " filterlabel"} key={j}>
															<input type="checkbox" name={thisFilter} checked={checked.checked ? 'checked' : ''} onChange={self.filterByTarget.bind(null,thisFilter,filtertype)}/>
															{thisFilter}
														</label>
													);
												}
											})}
											<label className="btn btn-primary selectall">
												<input type="checkbox" name={filtertype} onChange={self.selectAllFilter}/> Select all
											</label>
										</div>
									</li>
								)
							})}
							<li className="menuresetbtn mobile-only">
								<span className={resetdisabled + ' btn btn-block center'} onClick={this.resetAll}>Reset</span>
							</li>
						</ul>
					</nav>
				</header>
				<main className="main" onClick={this.clearMobileMenus}>
					<div className="container">
						<div className="activefilters">
							{this.state.activeFilters.map(function(filter,i,key){
								var filterkey = this.state.activeFilters[i].name;
								return (
									<span className="filt" data-type={filterkey} onClick={this.clearfilter}>{filterkey}</span>
								);
							}, this)}
						</div>
						
						<div className={this.state.visibleprojects.length != 0 ? 'pagination mobile-hide' : 'pagination hidden mobile-hide'}>
							<span className="position">Page {this.state.onpage + 1} of {Math.ceil(this.state.matchingprojects.length / this.state.perpage)}</span>
							<span className={resetdisabled + ' btn float-left'} onClick={this.resetAll}>Reset</span>
							<span className={this.state.onpage + 1 == 1 ? 'btn disabled' : 'btn'}  onClick={this.prevPage}>Prev</span>
							<span className={this.state.onpage + 1 == Math.ceil(this.state.matchingprojects.length / this.state.perpage) ? 'btn disabled' : 'btn'} onClick={this.nextPage}>Next</span>
						</div>
						
						<div className={this.state.visibleprojects.length != 0 ? 'hidden' : ''}>No matching results found.</div>

						<ul className="flexigrid">
							{this.state.visibleprojects.map(function(project,i,key){
								var techs = [];
								var devs = [];
								var designers = [];
								var techhtml = '';
								var devshtml = '';
								var designershtml = '';
								//create technologies list
								if(typeof project.filters.technology !== 'undefined' && project.filters.technology[0] !== 'not set'){
									for(var tech = 0; tech < project.filters.technology.length; tech++){
										if(project.filters.technology[tech].length){
											techs.push(<span className="smalltag" key={tech}>{project.filters.technology[tech]}</span>);
										}
									}
									techhtml = <li><strong>Technology:</strong> {techs}</li>;
								}
								//create developers list
								if(typeof project.filters.developer !== 'undefined' && project.filters.developer[0] !== 'not set'){
									for(var dev = 0; dev < project.filters.developer.length; dev++){
										if(project.filters.developer[dev].length){
											devs.push(<span className="smalltag" key={dev}>{project.filters.developer[dev]}</span>);
										}
									}
									devshtml = <li><strong>Developer:</strong> {devs}</li>
								}
								//create designers list
								if(typeof project.filters.designer !== 'undefined' && project.filters.designer[0] !== 'not set'){
									for(var design = 0; design < project.filters.designer.length; design++){
										if(project.filters.designer[design].length){
											designers.push(<span className="smalltag" key={design}>{project.filters.designer[design]}</span>);
										}
									}
									designershtml = <li><strong>Designer:</strong> {designers}</li>;
								}
								var elstatus = '';
								if(typeof project.filters.status !== 'undefined' && project.filters.status[0] !== 'not set'){
									elstatus = <span className={project.filters.status ? 'projstatus' :'projstatus hidden'} data-stat={project.filters.status}></span>;
								}
								var demolink = <li></li>;
								if(typeof project.filters.demo !== 'undefined' && project.filters.demo[0] !== 'not set'){
									demolink = <li><a href={'../work/work.php?id=' + project.demoid} target='_blank'>Demo</a></li>;
								}
								var thumbnail = '';
								var thumbnailpopup = '';
								var thumbnailclass = '';
								if(typeof project.img !== 'undefined' && project.img.length > 1){
									thumbnail = <img src={'static/img/projects/' + project.img} className="thumbnailimg"/>;
									thumbnailpopup = <img src={'static/img/projects/' + project.img} className="thumbnailimg"/>;
									thumbnailclass = 'hasimg';
								}
								var launchdate = '';
								if(typeof project.date !== 'undefined'){
									launchdate = project.date;
								}
								var zorglink = '';
								if(typeof project.zorg !== 'undefined'){
									zorglink = <li><a href={project.zorg} target="_blank">Campaign stats</a> (requires login)</li>;
								}

								return (
									<li className={project.hidden ? 'gridcol hidden' : 'gridcol'} key={i}>
										<div className="project">
											<div className={thumbnailclass + " thumbnail mainimg"} onClick={this.showPopup.bind(this,i,project.jobname)}>
												{thumbnail}
												<span className="tag">{project.filters.format}</span>
											</div>
											<div className="firstinner">
												<h2 className="jobname h5" onClick={this.showPopup.bind(this,i,project.jobname)}>{project.jobname}</h2>
												<p className="client">{project.filters.client}, {project.filters.year} <span className="hidden">{launchdate}</span></p>
							   					{elstatus}
							   				</div>
											<span className="btn more-details" onClick={this.showPopup.bind(this,i,project.jobname)}>more</span>

											<div className={project.expanded ? 'detailswrapper visible' : 'detailswrapper'} onClick={this.showPopup.bind(this,i)}></div>
											<div className={project.expanded ? 'details visible' : 'details'}>
												<div className="leftcol thumbnail popupimg">
													{thumbnailpopup}
								   					{elstatus}
												</div>
												<div className="rightcol">
													<div onClick={this.showPopup.bind(this,i)} className="closelnk" title="Back"><img src="static/img/cross.svg" alt=""/></div>
													<h2 className="jobname">{project.jobname}</h2>
													<h3 className="client">{project.filters.client}, {project.filters.year}</h3>
													<p><span className="tag">{project.filters.format}</span></p>
													<div className={project.desc ? 'desc' :'desc hidden'} dangerouslySetInnerHTML={{__html: project.desc}}></div>
													<hr/>
													<ul className="list">
														<li className={project.filters.workload ? '' :'hidden'}><strong>Role:</strong> <span className="smalltag">{project.filters.workload}</span></li>
														{techhtml}
														{designershtml}
														{devshtml}
													</ul>
												</div>
												<ul className="links">
													{demolink}
													<li className={project.liveURL ? '' :'hidden'}><a href={project.liveURL} target='_blank' >Live</a></li>
													<li className={project.savedURL ? '' :'hidden'}><a href={project.savedURL} target='_blank'>Original</a></li>
													<li className={project.moreURL ? '' :'hidden'}><a href={project.moreURL} target='_blank'>More detail</a></li>
													<li className={project.repo ? '' :'hidden'}><a href={project.repo} target='_blank'>Repo</a></li>
												</ul>
											</div>
										</div>
									</li>
								);
							}, this)}
						</ul>
						<div className={this.state.visibleprojects.length != 0 ? 'pagination' : 'pagination hidden'}>
							<span className="position">Page {this.state.onpage + 1} of {Math.ceil(this.state.matchingprojects.length / this.state.perpage)}</span>
							<span className={this.state.onpage + 1 == 1 ? 'btn disabled' : 'btn'}  onClick={this.prevPage}>Prev</span>
							<span className={this.state.onpage + 1 == Math.ceil(this.state.matchingprojects.length / this.state.perpage) ? 'btn disabled' : 'btn'} onClick={this.nextPage}>Next</span>
						</div>
					</div>
				</main>
			</div>
		);
	}
});

ReactDOM.render(
	<ClientData url='./static/assets/work.json'/>,
	document.getElementById('react')
);
