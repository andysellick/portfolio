import React from 'react';

var PopupBlock = React.createClass({
	closePopup: function(){
		this.props.closefunction(-1);
	},
	generatePopup: function(project){
		var bg = '';
		if(typeof project.img !== 'undefined' && project.img.length > 1){
			bg = {backgroundImage: 'url(static/img/projects/' + project.img + ')'}
		}		
		return (
			<div className="popupwrapper">
				<div className="mask" onClick={this.closePopup.bind()}></div>
				<div className="popup">
					<div className="leftcol thumbnail" style={bg}>
						{project.filters.status[0] !== 'not set' &&
							<span className='projstatus' data-stat={project.filters.status}></span>
						}
					</div>
					<div className="rightcol">
						<div onClick={this.closePopup.bind()} className="closelnk" title="Back"><img src="static/img/cross.svg" alt=""/></div>
						<h2 className="jobname">{project.jobname}</h2>
						<h3 className="client">{project.filters.client}, {project.filters.year}</h3>
						<p><span className="tag">{project.filters.format}</span></p>
						<div className={project.desc ? 'desc' :'desc hidden'} dangerouslySetInnerHTML={{__html: project.desc}}></div>
						<hr/>
						<ul className="list">
							<li className={project.filters.workload ? '' :'hidden'}><strong>Role:</strong><span className="smalltag">{project.filters.workload}</span></li>
							{project.filters.technology[0] !== 'not set' &&
								<li><strong>Technology:</strong> 
									{project.filters.technology.map(function(tech){
										return (
											<span className="smalltag">{tech}</span>
										);
									}, this)}
								</li>
							}
							{project.filters.designer[0] !== 'not set' &&
								<li><strong>Designer:</strong> 
									{project.filters.designer.map(function(designer){
										return (
											<span className="smalltag">{designer}</span>
										);
									}, this)}
								</li>
							}
						</ul>
					</div>
					<ul className="links">
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

