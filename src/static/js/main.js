import React from 'react';
import ReactDOM from 'react-dom';
import data from '../assets/work.json';
import HeaderBlock from './header.js';
import NavBlock from './nav.js';
import ActiveFiltersBlock from './activefilters.js';
import PopupBlock from './popup.js';
import ProjectBlock from './project.js';
import PaginationBlock from './pagination.js';

var ClientData = React.createClass({
	getInitialState: function() {
		return {
			projects: [], //this holds all of the projects
			matchingprojects: [], //this holds all of the projects that match the current filter/search state
			filters: {}, //this holds all the possible filters
			activeFilters: {}, //this holds chosen filters only
			popup: -1,
			perpage: 12, //number of items to show per page
			onpage: 0, //current page
			resetstatus: 0, //if reset status is 0, reset button is disabled
			searchtext: '',
			mobileHeaderState: '', //controls visibility of mobile menu/search by applying a class
			headerState: '', //controls visibility of header when popup open on mobile
			mainState: '' //controls visibility of main element when popup open on mobile
		};
	},

	componentDidMount: function() {
		var projects = this.sortProjectData(data);
		var filters = this.extractAllFilters(projects);	
		//insert the sorted project data into the state
		this.setState({	projects: projects, matchingprojects: projects, filters: filters });
	},
	
	//get original data, sort projects by date, should only need to do this once
	sortProjectData: function(projdata){
		var projects = [];

		for(var d = 0; d < projdata.length; d++){
			var flag = -1;
			//if no specific date, concoct a rough one using the year
			if(typeof projdata[d].date === 'undefined'){
				projdata[d].date = projdata[d].filters.year[0] + '/01/01';
			}

			for(var n = 0; n < projects.length; n++){
				//if(projdata[d].jobname > projdata[n].jobname){ //order alphabetically
				if(projdata[d].date > projects[n].date){ //order by date of work
					flag = n;
				}
			}
			//insert into projdata according to date
			if(flag === -1){
				projects.unshift(projdata[d]);
			}
			else {
				projects.splice(flag + 1, 0, projdata[d]);
			}
		}
		projects.reverse();
		return(projects);
	},
	
	//given project data, find all possible filters within it
	extractAllFilters: function(projdata){
		var filters = {};
		//now use the projects data to find all the possible filters
		for(var a = 0; a < projdata.length; a++) {
			// loop through projects array and find each object
			for (var key in projdata[a].filters) {
				if(projdata[a].filters[key][0].length){ //only check/insert if the first array value is not an empty string
					for (var b = 0; b < projdata[a].filters[key].length; b++) {
						//if there already exists a filter for whatever this is, e.g. 'client'
						if(filters.hasOwnProperty(key)) {
							var found = 0;
							//check to see if there is already a filter in this group with this name
							var valtoinsert = projdata[a].filters[key][b].toLowerCase();
							for(var c = 0; c < filters[key].length; c++) {
								if(filters[key][c].name === valtoinsert){
									found = 1;
									break;
								}
							}
							//not found, so add it
							if(!found){
								var topush = {'name' : valtoinsert, 'checked' : 0};
								//search through and insert alphabetically
								var flag2 = -1;
								for(var alpha = 0; alpha < filters[key].length; alpha++){
									if(topush.name > filters[key][alpha].name){
										flag2 = alpha;
									}
								}
								if(flag2 === -1){
									filters[key].unshift(topush); //add to the start of the array
								}
								else {
									filters[key].splice(flag2 + 1,0,topush);
								}
							}
						}
						//this filter does not already exist in the filters list
						else {
							filters[key] = [];
							filters[key].push({'name' : projdata[a].filters[key][b].toLowerCase(), 'checked' : 0});
						}
					}
				}
			}
		}

		//insert 'not set' as an actual filter option for each filter
		for(var fkey in filters){
			filters[fkey].push({'name': 'not set', 'checked' : 0});
		}
		//insert 'not set' into any blank project data
		for(var proj = 0; proj < projdata.length; proj++) {
			for(var newkey in filters){
				//if the project does not have a filter called this, or it's been set to [''], set it to 'not set'
				if(!projdata[proj].filters.hasOwnProperty(newkey) || projdata[proj].filters[newkey][0] === ''){
					projdata[proj].filters[newkey] = ['not set'];
				}
				else {
					//lowercase everything in the filters
					for(var lower = 0; lower < projdata[proj].filters[newkey].length; lower++){
						projdata[proj].filters[newkey][lower] = projdata[proj].filters[newkey][lower].toLowerCase();
					}
				}
			}
		}	
		return(filters);
	},

	//handle the popup windows containing additional info about projects
	showPopup: function(i) {
		var newclass = '';
		if(i !== -1){
			newclass = 'mobile-hide';
		}
		this.setState({ popup: i, headerState: newclass, mainState: newclass});
	},
	
	//go through all the projects and see if they match these chosen filters
	updateProjects: function(clickedfilters){
		var matchedprojects = [];
		for(var p = 0; p < this.state.projects.length; p++){
			var thisp = this.state.projects[p];
			var matches = 1;
			Object.keys(clickedfilters).forEach(function(key,index){
				var matchesfilter = 0;
				for(var f = 0; f < clickedfilters[key].length; f++){
					if(thisp.filters[key].indexOf(clickedfilters[key][f].name) !== -1){
						matchesfilter = 1;
					}
				}
				if(!matchesfilter){
					matches = 0;
				}
			});
			if(matches){
				matchedprojects.push(thisp);
			}
		}
		return(matchedprojects);
	},
	
	//when a filter checkbox is clicked, set that filter accordingly
	filterByTarget: function (clicked,filtertype,number){
		var filters = this.state.filters;
		filters[filtertype][number].checked = 1 - filters[filtertype][number].checked; //toggle the filter on or off
		var clickedfilters = this.findAllClickedFilters();
		var matchingprojects = this.updateProjects(clickedfilters);
		this.setState({filters: filters, activeFilters: clickedfilters, matchingprojects: matchingprojects, onpage: 0});
	},
	
	//clicking on one of the 'active filters' underneath the menu, clears all chosen filters in that group
	clearFilter: function(name){
		var activeFilters = this.state.activeFilters;
		delete activeFilters[name];
		var filters = this.switchAllFilters(name,0);
		var matchedprojects = this.updateProjects(activeFilters);
		this.setState({filters: filters, activeFilters: activeFilters,matchingprojects: matchedprojects});
	},	
	
	//select all filters within a group, e.g. all clients
	selectAllFilter: function(e){		
		var name = e.target.name;
		var onoroff = e.target.checked ? 1 : 0;
		var filters = this.switchAllFilters(name,onoroff);

		//add or remove this group of filters from active filters
		var activeFilters = this.state.activeFilters;
		if(onoroff){
			activeFilters[name] = filters[name];
		}
		else {
			delete activeFilters[name];
		}
		//update what projects are shown
		var matchingprojects = this.updateProjects(activeFilters);
		this.setState({filters: filters, activeFilters: activeFilters, matchingprojects: matchingprojects});
	},
	
	//change page using navigation
	changePage: function(direction){
		//var newdir = parseInt(this.state.onpage + direction);
		this.setState({onpage:direction});
	},	
	
	//resets everything to default state
	resetAll: function(){
		var filters = this.state.filters;
		for(var key in filters){
			for(var f = 0; f < filters[key].length; f++){
				filters[key][f].checked = 0;
			}
		}
		var activeFilters = {};
		var matchingprojects = this.state.projects;
		this.setState({filters: filters, searchtext: '', activeFilters: activeFilters, matchingprojects: matchingprojects, onpage: 0});
	},
	
	//handles text input into the search box
	typeSearch: function(typed){
		var clickedfilters = this.findAllClickedFilters();
		var matchingprojects = this.updateProjects(clickedfilters);			
		var onpage = this.state.onpage;
		if(typed.length > 2){
			var newmatchingprojects = [];
			for(var p = 0; p < matchingprojects.length; p++){
				var searchthis = matchingprojects[p].jobname + ' ' + matchingprojects[p].desc;
				var found = searchthis.toLowerCase().match(typed.toLowerCase());
				if(found){
					newmatchingprojects.push(matchingprojects[p]);
				}
			}
			matchingprojects = newmatchingprojects;
			onpage = 0;
		}
		this.setState({searchtext: typed, matchingprojects: matchingprojects,onpage: onpage});
	},	

	//toggle general classes that control appearance of mobile menu, search
	toggleMenuClasses: function(newclass){
		var oldclass = this.state.mobileHeaderState;
		if(oldclass === newclass){
			newclass = '';
		}
		this.setState({mobileHeaderState: newclass});
	},
	
	/* smaller functions that get used by other top level functions */
	
	//find all clicked filters and put them into a new object
	findAllClickedFilters: function(){
		var clickedfilters = {};
		var filters = this.state.filters;
		Object.keys(filters).forEach(function(key,index){
			for(var i = 0; i < filters[key].length; i++){
				if(filters[key][i].checked){
					if(!clickedfilters.hasOwnProperty(key)){
						clickedfilters[key] = [];
					}
					clickedfilters[key].push(filters[key][i]);
				}
			}
		});
		return(clickedfilters);
	},
	//set the checked status of all filters in a group
	switchAllFilters: function(name,onoroff){
		var filters = this.state.filters;
		for(var f = 0; f < filters[name].length; f++){
			filters[name][f].checked = onoroff;
		}
		return(filters);
	},

	render: function() {
		var resetstatus = 1; //this value means the reset button is clickable
		if((Object.keys(this.state.activeFilters).length === 0 && this.state.activeFilters.constructor === Object) && this.state.searchtext.length === 0){
			resetstatus = 0;
		}
		return (
			<div>
				<header className={this.state.mobileHeaderState + ' ' + this.state.headerState + ' header'}>
					<HeaderBlock 
						showing={this.state.matchingprojects.length} 
						total={this.state.projects.length} 
						showreset={resetstatus} 
						resetall={this.resetAll} 
						searchtext={this.state.searchtext} 
						typeSearch={this.typeSearch}
						toggleMenuClasses={this.toggleMenuClasses}
					/>
					<NavBlock 
						filters={this.state.filters} 
						onChange={this.filterByTarget} 
						selectAll={this.selectAllFilter}
						showreset={resetstatus} 
						resetall={this.resetAll} 
					/>
				</header>
				<main className={this.state.mainState + ' main'} onClick={this.toggleMenuClasses.bind(null,'')}>
					<div className="container">
						<ActiveFiltersBlock filters={this.state.activeFilters} clearFilter={this.clearFilter}/>						
						<PaginationBlock length={this.state.matchingprojects.length} onpage={this.state.onpage} perpage={this.state.perpage} changePage={this.changePage}/>																	
						<ProjectBlock projects={this.state.matchingprojects} showpopup={this.showPopup} onpage={this.state.onpage} perpage={this.state.perpage}/>
						<PaginationBlock length={this.state.matchingprojects.length} onpage={this.state.onpage} perpage={this.state.perpage} changePage={this.changePage}/>
					</div>
				</main>
				<PopupBlock project={this.state.matchingprojects[this.state.popup]} closefunction={this.showPopup}/>
			</div>
		);
	}
});

ReactDOM.render(
	<ClientData/>,document.getElementById('react')
);
