import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Moment from 'react-moment'
import { deleteExperince } from '../../actions/profileActions'

class Experince extends Component {

    onDeleteClick = (id) => {
        this.props.deleteExperince(id);
    }

    render() {
        const experince = this.props.experince.map(exp => (
            <tr key={exp._id}>
                <td>{exp.company}</td>
                <td>{exp.title}</td>
                <td>
                <Moment format="YYYY/MM/DD">{exp.from}</Moment> - {exp.to === null ? ("Present") : 
                (<Moment format="YYYY/MM/DD">{exp.to}</Moment>)} 
                </td>
                <td><button onClick={()=> this.onDeleteClick(exp._id)} className="button btn btn-danger">Delete</button></td>
            </tr>
        ))
        return (
            <div>
                <h4 className="mb-4">Experience Credentials</h4>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Company</th>
                            <th>Title</th>
                            <th>Years</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {experince}
                    </tbody>
                </table>
            </div>
        )
    }
}

Experince.propTypes = {
    deleteExperince: PropTypes.func.isRequired
}

export default connect(null, { deleteExperince })(Experince);
