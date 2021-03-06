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
				<span className="position">Page {onpage} of {Math.ceil(this.props.length / this.props.perpage)}</span>
				<span className={onpage === 1 ? 'btn disabled' : 'btn'}  onClick={this.changePage.bind(this,-1)}>Prev</span>
				<span className={onpage === Math.ceil(this.props.length / this.props.perpage) ? 'btn disabled' : 'btn'} onClick={this.changePage.bind(this,1)}>Next</span>
			</div>
		);
	}
});
module.exports = PaginationBlock;
