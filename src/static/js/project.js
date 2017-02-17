import React from 'react';

var ProjectBlock = React.createClass({
	showPopup: function(i){
		i += this.props.onpage * this.props.perpage;
		this.props.showpopup(i);
	},
	//if there are projects to show, display them
	showProjects: function(projects){
		return(
			<ul className="flexigrid">
				{projects.map(function(project,i,key){
					var bg = '';
					if(typeof project.img !== 'undefined' && project.img.length > 1){
						bg = {backgroundImage: 'url(static/img/projects/' + project.img + ')'}
					}							
					
					//not actually using this
					var launchdate = '';
					if(typeof project.date !== 'undefined'){
						launchdate = project.date;
					}

					return (
						<li className={project.hidden ? 'gridcol hidden' : 'gridcol'} key={i}>
							<div className="project" onClick={this.showPopup.bind(this,i)}>
								<div className="thumbnail" style={bg}>
									{project.filters.status[0] !== 'not set' &&
										<span className='projstatus' data-stat={project.filters.status}></span>
									}
									<span className="category">{project.filters.format}</span>
								</div>
								<div className="firstinner">
									<h2 className="jobname h5">{project.jobname}</h2>
									<p className="client">{project.filters.client}, {project.filters.year} <span className="hidden">{launchdate}</span></p>
								</div>
								<span className="btn more-details">more</span>
							</div>
						</li>
					);
				}, this)}
			</ul>
		);		
	},
	//if there is nothing to show, display a message
	showNoProjects: function(){
		return (
			<div className=''>No matching results found.</div>
		);
	},	
    render: function(){
		var projects = this.props.projects.slice(this.props.onpage * this.props.perpage,(this.props.onpage * this.props.perpage) + this.props.perpage);		
		return(projects.length > 0 ? this.showProjects(projects) : this.showNoProjects());
	}
});
module.exports = ProjectBlock;

