import React from 'react';

var NavBlock = React.createClass({displayName: 'NavBlock',
	resetAll: function(){	
	},
	selectAllFilter: function(){
	},
	filterByTarget: function(clicked,filtertype,j){
		//console.log('component filterByTarget');
		this.props.onChange(clicked,filtertype,j);
	},
    render: function(){
		var props = this.props.filters;
		var self = this;
        return (
			<nav className="mainmenu">
				<ul className="mainfilters">
					{Object.keys(props).map(function(filtertype,i) {
						var thisfilter = props[filtertype];
						return(
							<li className="filteritem" key={i}>
								<span className="droptrigger"><span className="droptriggerinner">{filtertype}</span></span>
								<div className="dropcontent">
									{Object.keys(thisfilter).map(function(filter,j){
										//console.log(filtersObject[filtertype].length, filtertype, j,j % Math.ceil(filtersObject[filtertype].length / 4));
										var currFilter = thisfilter[filter].name;
										var checked = thisfilter[filter];

										if(currFilter.length){
											return(
												<label className='filterlabel' key={j}>
													<input type="checkbox" name={currFilter} checked={checked.checked ? 'checked' : ''} onChange={self.filterByTarget.bind(null,currFilter,filtertype,j)}/>
													{currFilter}
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
						<span className='FIXME  btn btn-block center' onClick={self.resetAll}>Reset</span>
					</li>
				</ul>
			</nav>
		);
	}
});
module.exports = NavBlock;