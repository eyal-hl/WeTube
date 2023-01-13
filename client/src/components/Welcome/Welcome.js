import React, { useState } from 'react';
import { createConnection } from '../../utils/socket';
import { Container, Row, Col } from 'react-grid-system';
import styled from 'styled-components';
import Topbar from '../common/Topbar';
import StartForm from './StartForm';
import { getVideoId } from '../../utils/helper';

function Welcome(props) {
	// const [canRedirectToRoom, setRedirect] = useState(false);
	let formEnd = null;
	const [hostLoading, setHostLoading] = useState(false);


	const onHost = async (username, videoUrl) => {
		// use socket id as room address
		setHostLoading(true);
		const videoId = getVideoId(videoUrl);
		const socket = await createConnection(username, null, videoId);
		setHostLoading(false);

		props.history.push({
			pathname: `/room/${socket.id}`, // socket.id === roomid
			state: { hostId: socket.id, username, videoId },
			socket,
		});
	};

	const onJoin = (username, joinUrl) => {
		// TODO: Add verification for join url
		const splitUrl = joinUrl.split('/');
		const roomId = splitUrl[splitUrl.length - 1];
		props.history.push({
			pathname: `/room/${roomId}`,
			state: { username },
		});
	};

	return (
		<React.Fragment>
			
			<Container fluid>
				<Row align='center' style={styles.formContainer}>
					<Col md={2}></Col>
					<StartForm
						onHost={onHost}
						onJoin={onJoin}
						hostLoading={hostLoading}
					/>
					<Col md={2}></Col>
					<div className='dummy' ref={(el) => (formEnd = el)}></div>
				</Row>
			</Container>
		</React.Fragment>
	);
}

const styles = {
	formContainer: {
		backgroundImage: 'linear-gradient(#f9f9f9, #fff)',
		marginBottom: '40px',
		zIndex: 10,
		height: '100vh',
	},
	heroButton: {
		margin: '15px 0',
		minWidth: '200px',
		padding: '15px 10px',
	},
};

export default Welcome;
