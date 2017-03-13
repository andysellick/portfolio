import React from 'react';

var HeaderBlock = React.createClass({displayName: 'HeaderBlock',
	typeSearch: function(e){
		this.props.typeSearch(e.target.value);
	},
    render: function(){
        return (
			<div className="headerinner">
				<div className="container">
					<span className="mobilemenu mobile-only" onClick={this.props.toggleMenuClasses.bind(null,'showmenu')}><img src="static/img/bars.svg"/></span>
				</div>
			</div>
		);
	}
});
module.exports = HeaderBlock;

