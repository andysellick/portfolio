import React from 'react';

var ActiveFiltersBlock = React.createClass({displayName: 'ActiveFiltersBlock',
    render: function(){
		var keys = this.props.filters;
		return(
			<div className="activefilters">
				{Object.keys(keys).map(function(filterkey,i,key){
					return (
						<span className="filt" data-type={filterkey} onClick={this.clearfilter}>{filterkey}</span>
					);
				}, this)}
			</div>
		);
	}
});
module.exports = ActiveFiltersBlock;
