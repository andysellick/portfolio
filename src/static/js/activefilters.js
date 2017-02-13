import React from 'react';

var ActiveFiltersBlock = React.createClass({
	clearFilter: function(name){
		this.props.clearFilter(name);
	},
    render: function(){
		var keys = this.props.filters;
		return(
			<div className="activefilters">
				{Object.keys(keys).map(function(filterkey,i,key){
					return (
						<span className="filt" data-type={filterkey} onClick={this.clearFilter.bind(null,filterkey)}>{filterkey}</span>
					);
				}, this)}
			</div>
		);
	}
});
module.exports = ActiveFiltersBlock;
