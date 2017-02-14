import React from 'react';

var HeaderBlock = React.createClass({displayName: 'HeaderBlock',
	typeSearch: function(e){
		this.props.typeSearch(e.target.value);
	},
	resetDisabled: function(){
		console.log('resetDisabled fixme');
	},	
    render: function(){
        return (
			<div className="headerinner">
				<div className="container">
					<span className="mobilemenu mobile-only" onClick={this.showMobileMenu}><img src="static/img/bars.svg"/></span>
					<span className="mobilesearch mobile-only" onClick={this.showMobileSearch}><img src="static/img/search-white.svg"/></span>
					<div className="row">
						<div className="span4">
							<a href="" className="mainlink"></a>
						</div>
						<div className="span8">
							<div className="headercontrols float-right">
								<span className="displaycount float-left">Showing {this.props.showing} of {this.props.total}</span>
								<div className="searchbox float-left">
									<div className="inputwrapper">
										<input id="searchbox" type="search" placeholder="search..." value={this.props.searchtext} onChange={this.typeSearch}/>
									</div>
									<span className="closesearch mobile-only" onClick={this.closeSearch}><img src="static/img/cross-white.svg" alt="Close"/></span>
									<button type="submit" className="btn hidden" onClick={this.clearSearch}>Clear</button>
								</div>
								<span className={this.props.showreset ? 'btn-primary btn float-left mobile-hide' : 'disabled btn float-left mobile-hide'} onClick={this.props.resetall}>Reset</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});
module.exports = HeaderBlock;

