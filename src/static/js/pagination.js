import React from 'react';

var PaginationBlock = React.createClass({
	changePage: function(direction){
		direction = this.props.onpage + direction;
		if(direction >= 0 && direction < Math.ceil(this.props.length / this.props.perpage)){
			this.props.changePage(direction);
		}
	},
	render: function(){
		var onpage = Math.min(Math.ceil(this.props.length / this.props.perpage),this.props.onpage + 1);
		return(
			<div className={this.props.length !== 0 ? 'pagination' : 'pagination hidden'}>
				<span className="position spacer">Page {onpage} of {Math.ceil(this.props.length / this.props.perpage)}</span>
				<span className={onpage === 1 ? 'btn disabled spacer' : 'btn spacer'}  onClick={this.changePage.bind(this,-1)}>Prev</span>
				<span className={onpage === Math.ceil(this.props.length / this.props.perpage) ? 'btn disabled' : 'btn'} onClick={this.changePage.bind(this,1)}>Next</span>
				<span className={this.props.showreset ? 'btn-primary btn float-left mobile-hide' : 'disabled btn float-left mobile-hide'} onClick={this.props.resetall}>Reset</span>
			</div>
		);
	}
});
module.exports = PaginationBlock;
