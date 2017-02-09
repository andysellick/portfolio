import React from 'react';

var PopupBlock = React.createClass({
	closePopup: function(){
		this.props.closefunction(-1);
	},
	generatePopup: function(project){
		var thumbnailpopup = '';
		if(typeof project.img !== 'undefined' && project.img.length > 1){
			thumbnailpopup = <img src={'static/img/projects/' + project.img} className="thumbnailimg"/>;
		}
		//fixme this is duplicated in main.js
		var elstatus = '';
		if(typeof project.filters.status !== 'undefined' && project.filters.status[0] !== 'not set'){
			elstatus = <span className={project.filters.status ? 'projstatus' :'projstatus hidden'} data-stat={project.filters.status}></span>;
		}
					
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
		var demolink = <li></li>;
		if(typeof project.filters.demo !== 'undefined' && project.filters.demo[0] !== 'not set'){
			demolink = <li><a href={'../work/work.php?id=' + project.demoid} target='_blank'>Demo</a></li>;
		}
		return (
			<div className="popupwrapper">
				<div className="mask" onClick={this.closePopup.bind()}></div>
				<div className="project popup">
					<div className="leftcol thumbnail popupimg">
						{thumbnailpopup}
						{elstatus}
					</div>
					<div className="rightcol">
						<div onClick={this.closePopup.bind()} className="closelnk" title="Back"><img src="static/img/cross.svg" alt=""/></div>
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
		);	
	},
    render: function(){
		var project = this.props.project;
		return(typeof project !== 'undefined' ? this.generatePopup(project) : <div></div>);
	}
});
module.exports = PopupBlock;

