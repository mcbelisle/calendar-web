import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import moment from 'moment'
import {
	Card,
	Container,
	Row,
	Col,
	ProgressBar,
	Button,
	Alert,
} from 'react-bootstrap'
import BigCalendar from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import queryString from 'query-string'
// Containers
import EventDetailsContainer from '../../containers/EventDetails'
import RemindersModalContainer from '../../containers/RemindersModal'
import SendInvitesModalContainer from '../../containers/SendInvitesModal'
import FAQs from '../FAQ'

import { uuid } from '../../core/eventFN'

let localizer = BigCalendar.momentLocalizer(moment)
let allViews = Object.keys(BigCalendar.Views).map(k => BigCalendar.Views[k])

class Calendar extends Component {
	constructor(props) {
		super(props)
		this.bound = [
			'handleHideInstructions',
			'handleAddEvent',
			'handleEditEvent',
			'handleAddCalendarByUrl',
		].reduce((acc, d) => {
			acc[d] = this[d].bind(this)
			return acc
		}, {})
	}

	componentWillMount() {
		if (this.props.public) {
			const query = queryString.parse(this.props.location.search)
			const calendarName = query.c
			if (
				calendarName &&
				this.props.events.user &&
				this.props.events.user.username &&
				this.props.events.user.username.length > 0
			) {
				if (calendarName.endsWith(this.props.events.user.username)) {
					this.props.showMyPublicCalendar(calendarName)
				} else {
					this.props.viewPublicCalendar(calendarName)
				}
			} else {
				this.props.history.replace('/')
			}
		}
	}

	handleHideInstructions() {
		this.props.hideInstructions()
	}

	handleEditEvent(event) {
		const { pickEventModal } = this.props
		var eventType
		if (event.mode === 'read-only') {
			eventType = 'view'
		} else {
			eventType = 'edit'
		}
		pickEventModal({
			eventType,
			eventInfo: event,
		})
	}

	handleAddEvent(slotInfo) {
		const { pickEventModal } = this.props
		slotInfo.uid = uuid()
		pickEventModal({
			eventType: 'add',
			eventInfo: slotInfo,
		})
	}

	handleAddCalendarByUrl(event) {
		if (event.key === 'Enter') {
			const { showSettingsAddCalendar } = this.props
			showSettingsAddCalendar(event.target.value)
		}
	}

	eventStyle(event, start, end, isSelected) {
		var bgColor = event && event.hexColor ? event.hexColor : '#265985'
		var style = {
			backgroundColor: bgColor,
			borderColor: 'white',
		}
		return {
			style: style,
		}
	}

	getEventStart(eventInfo) {
		return eventInfo ? new Date(eventInfo.start) : new Date()
	}

	getEventEnd(eventInfo) {
		return eventInfo && (eventInfo.end || eventInfo.calculatedEndTime)
			? eventInfo.end
				? new Date(eventInfo.end)
				: new Date(eventInfo.calculatedEndTime)
			: new Date()
	}

	render() {
		console.log('[Calendar.render]', this.props)
		const {
			signedIn,
			showGeneralInstructions,
			eventModal,
			inviteSuccess,
			currentCalendarLength,
			currentCalendarIndex,
			showError,
			error,
			showSettingsAddCalendar,
			markErrorAsRead,
			showRemindersModal,
			showSendInvitesModal,
		} = this.props
		const {
			handleHideInstructions,
			handleEditEvent,
			handleAddEvent,
			handleAddCalendarByUrl,
		} = this.bound

		let events = Object.values(this.props.events.allEvents)

		const calendarView = (
			<div>
				<div style={{ height: 8 }}>
					{currentCalendarLength && (
						<ProgressBar
							animated
							variant="success"
							style={{ height: 8 }}
							now={currentCalendarIndex + 1}
							max={currentCalendarLength}
						/>
					)}
				</div>
				<BigCalendar
					localizer={localizer}
					selectable={this.props.signedIn}
					events={events}
					views={allViews}
					step={60}
					showMultiDayTimes
					defaultDate={new Date(moment())}
					onSelectEvent={event => handleEditEvent(event)}
					onSelectSlot={slotInfo => handleAddEvent(slotInfo)}
					style={{ minHeight: '500px' }}
					eventPropGetter={this.eventStyle}
					startAccessor={this.getEventStart}
					endAccessor={this.getEventEnd}
				/>
				{showError && (
					<div
						style={{
							position: 'fixed',
							bottom: '10px',
							right: '10px',
							zIndex: '10',
						}}
					>
						<Alert variant="danger" dismissible>
							{error}
							<p>
								<Button onClick={() => showSettingsAddCalendar()}>
									Go to settings
								</Button>
								<span> or </span>
								<Button onClick={markErrorAsRead}>Hide this message</Button>
							</p>
						</Alert>
					</div>
				)}
			</div>
		)

		const oicalendarsync = (
			<>
				For Android, use your favorite calendar app with{' '}
				<a href="https://play.google.com/store/apps/details?id=org.openintents.calendar.sync">
					MB Calendar-Sync
				</a>
			</>
		)
		return (
			<div className="body-container">
				{signedIn && showGeneralInstructions && (
					<Card>
						<Card.Header>
							How to use MB Calendar
							<button
								type="button"
								className="close"
								onClick={handleHideInstructions}
							>
								<span aria-hidden="true">×</span>
								<span className="sr-only">Close</span>
							</button>
						</Card.Header>
						<Card.Body>
							<Container style={{ width: '100%' }}>
								<div style={{ padding: '20px' }}>
									<Row style={{ textAlign: 'left' }}>
										<Col md={6}>
											<strong>Add an event: </strong> Click on a day to add
											event details. To add a multi-day event, click and hold
											while dragging across the days you want to include. <br />
										</Col>
										<Col md={6}>
											<strong>Update or delete an event:</strong> Click on event
											to open it. Edit the details and press{' '}
											<strong>Update</strong>. Or <strong>Delete</strong> the
											event entirely.
										</Col>
									</Row>
									<Row style={{ padding: '20px' }}>
										<Col xs={12} sm={2} style={{ textAlign: 'center' }}>
											<img
												src="/images/gcalendar.png"
												width="48px"
												height="48px"
												alt="Google Calendar"
											/>
										</Col>
										<Col xs={12} sm={10} style={{ textAlign: 'left' }}>
											<strong>Import events from Google Calendar</strong>: Need
											help, follow the{' '}
											<a
												target="_blank"
												rel="noopener noreferrer"
												href="https://cal.openintents.org/gtutorial.html"
											>
												2-step tutorial
											</a>
											.
											<br />
											<input
												style={{ width: '100%' }}
												type="text"
												placeholder="Paste a calendar URL, for example: https://calendar.google..../basic.ics"
												onKeyPress={handleAddCalendarByUrl}
											/>
										</Col>
									</Row>
									<hr />
									<Row>
										<Col xs={12}>{oicalendarsync}</Col>
									</Row>
								</div>
							</Container>
						</Card.Body>
					</Card>
				)}

				{!signedIn && (
					<Card>
						<Card.Header>
							<h2>Private, Encrypted Agenda in Your Cloud</h2>
						</Card.Header>
						<Card.Body>
							<Row>
								<Col>
									Use MB Calendar to keep track of all your events across all
									devices.
									<br />
									{oicalendarsync}
								</Col>
							</Row>
							<hr />
							<Row>
								<Col xs={12} md={5}>
									<strong>Learn about Blockstack! </strong> A good starting
									point is{' '}
									<a
										target="_blank"
										rel="noopener noreferrer"
										href="https://docs.blockstack.org"
									>
										Blockstack's documentation
									</a>
									.<br />
								</Col>
								<Col xs={12} md={2} style={{ padding: '10px' }}>
									<img
										src="blockstack.png"
										alt=""
										height="30"
										style={{ verticalAlign: 'middle' }}
									/>
								</Col>
								<Col xs={12} md={5}>
									<strong>Start now:</strong> Just login using the Blockstack
									button above!
								</Col>
							</Row>
						</Card.Body>
					</Card>
				)}

				{eventModal && !inviteSuccess && <EventDetailsContainer />}
				{showSendInvitesModal && <SendInvitesModalContainer />}
				{showRemindersModal && <RemindersModalContainer />}

				{calendarView}
				{!signedIn && <FAQs />}
			</div>
		)
	}
}

Calendar.propTypes = {
	location: PropTypes.object,
	public: PropTypes.bool,
	showMyPublicCalendar: PropTypes.func,
}

export default Calendar
