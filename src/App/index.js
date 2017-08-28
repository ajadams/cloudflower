// /src/Team/index.js

import { connect } from 'react-redux'
import React, { Component } from 'react'

// components
import Task from './task'
import Alert from './alert'
import TaskActionButton from './taskActionButton'

// actions 
import { 
	addTask, 
	editTask,
	getTasks, 
	saveTasks,
	deleteTask,
	closeAlert,
	resetSaved,
} from './../actions'

// styles
import './../styles/index.scss'

class App extends Component{
	constructor(props){
		super(props);

		this._addTask = this._addTask.bind(this);
		this._editTask = this._editTask.bind(this);
		this._getTasks = this._getTasks.bind(this);
		this._saveTasks = this._saveTasks.bind(this);
		this._deleteTask = this._deleteTask.bind(this);
		this._closeAlert = this._closeAlert.bind(this);

		this.state = {
			disabled: true,
		};
	}

	componentWillMount(){
		const { dispatch, _app } = this.props;

		// fetch tasks if we don't have any yet
		if( !_app.tasks.length ) this._getTasks();
	}

	componentWillReceiveProps(np){
		const { _app: thisAppState } = this.props;
		const { dispatch, _app: nextAppState } = np;

		const { tasks: thisTasks } = thisAppState;
		const { tasks: nextTasks } = nextAppState;

		// if this states tasks length is not equal to next tasks length, enable save button
		if( thisTasks.length !== nextTasks.length && 
			thisAppState.fetched_tasks === nextAppState.fetched_tasks ){
				this.state.disabled = false;

		}else if( !thisAppState.saved && nextAppState.saved ){
			this.state.disabled = true;
		}
	}

	_getTasks(){
		const { dispatch } = this.props;
		dispatch( getTasks() );
	}

	_addTask(){
		const { dispatch, _app: { tasks } } = this.props;
		let last_task_added = null;

		// grab the most recent tasks id, if there are any tasks
		if( tasks && tasks.length > 0 ) last_task_added = tasks[0].id;

		dispatch( addTask({ last_task_added }) );
	}

	_editTask( task ){
		const { dispatch } = this.props;
		dispatch( editTask( task ) );
	}

	_deleteTask({ id }){
		const { dispatch } = this.props;

		// pass id of the task to be deleted
		dispatch( deleteTask({ id }) );
	}

	_saveTasks(){
		const { dispatch, _app: { tasks } } = this.props;

		// send entire tasks list in POST request
		dispatch( saveTasks({ tasks }) );
	}

	_closeAlert(){
		const { dispatch } = this.props;
		dispatch( closeAlert() );
	}

	render(){
		const { _app } = this.props;
		const { disabled } = this.state;
		const _tasks = _app.tasks || [];

		return (
			<div>

				<div className="header">
					<div className="title">Tasks</div>

					<div>

						<TaskActionButton
							label="Add Task" 
							classNames="task-btn add" 
							disabled={false}
							onClick={ this._addTask } />

						<TaskActionButton
							label="Save" 
							classNames="task-btn save" 
							disabled={ disabled }
							onClick={ this._saveTasks } />

					</div>
				</div>

				{ _app.fetching_tasks && <div className="loading">Loading tasks...</div> }

				{  _app.error &&
					<div className="error" onClick={ this._getTasks }>
						<div>There was an error retrieving your tasks. Click here to try again.</div>

						{ _app.fetching_tasks && 
							<div>
								<i className="fa fa-refresh fa-fw fa-spin"></i>
								<span className="sr-only">Loading...</span>
							</div> }
					</div> 
				}

				<div className="tasks-container">
					{ (!_app.error && _tasks.length === 0 && !_app.fetching_tasks) && 
						<div className="empty-msg">You have 0 saved tasks. Click "Add Task" to create a new task</div> }

					{ _tasks.map(task => <Task 
											key={task.id} 
											{...task} 
											editTask={ this._editTask }
											deleteTask={ this._deleteTask } />) }
				</div>

				{ ((_app.saved && disabled) || _app.saving_tasks_err) && 
					<Alert
						error={ !!_app.saving_tasks_err }
						close={ this._closeAlert }
						msg={ _app.err_msg || 'Tasks saved successfully.' } /> }

			</div>
		);
	}
}

const mapStateToProps = (state, props) => {
  return {
    _app: state._app,
  };
} 

export default connect(mapStateToProps)(App)	;