import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getCurrentProfile, deleteAccount } from '../../actions/profileActions'
import Spinner from '../common/Spinner'
import ProfileActions from './ProfileActions'
import Experince from './Experince'
import Education from './Education'

class Dashboard extends Component {

    componentDidMount = () => {
        this.props.getCurrentProfile();
    }

    onDeleteClick = () => {
        this.props.deleteAccount();
    }

    render() {
        const { user } = this.props.auth;
        const { profile, loading } = this.props.profile;

        let dasboardContent;

        if(profile === null || loading) {
            dasboardContent = <Spinner />
        } else {
           // Check if logged user has a profile data
            if(Object.keys(profile).length > 0) {
                dasboardContent = (
                    <div>
                        <p className="lead text-muted">Welcome <Link to={`/profile/${profile.handle}`}>{user.name}</Link></p>  
                        <ProfileActions />
                        <Experince experince={profile.experince} />
                        <Education education={profile.education} />
                        <div style={{ marginBottom: '60px' }} />
                        <button onClick={this.onDeleteClick} className="btn btn-danger" >
                            Delete My Account
                        </button>
                    </div>
               );
            } else {
                dasboardContent = (
                   <div>
                       <p className="lead text-muted">Welcome {user.name}</p>
                       <p>You have not setup a profile, please add some info</p>
                       <Link to="/create-profile" className="btn btn-lg btn-info">Create Profile</Link>
                   </div>
                );
            }
        }

        return ( 
            <div className="dashboard">
                <div className="cotainer">
                    <div className="row">
                        <div className="col-md-12">
                            <h1 className="display-4">Dashboard</h1>
                            {dasboardContent}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

Dashboard.propTypes = {
    getCurrentProfile: PropTypes.func.isRequired,
    deleteAccount: PropTypes.func.isRequired,
    profile: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    profile: state.profile,
    auth: state.auth
})

export default connect(mapStateToProps, { getCurrentProfile, deleteAccount })(Dashboard);
