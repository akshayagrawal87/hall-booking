const dayjs = require("dayjs");

const express = require("express");

const app = express();

const hallData = require("./hallData");

const bookingData = require("./bookingData");

const bodyParser = require("body-parser");

const port = process.env.PORT || 4000;

try {
	app
		.use(bodyParser.json())
		.get("/", (req, res) => {
			//API FOR LANDING AND ALL API INFO.
			res
				.status(200)
				.send(
					"<h1>Welcome to Hall Booking App</h1><h2>Api 1: /room(get)</h2><h2>Api 2: /room(post)</h2><h2>Api 3:/bookRoom(post) /</h2> <h2>Api 4:/bookRoom(get) /</h2> <h2>Api 5:/customers(get) /</h2>"
				);
		})
		.get("/room", (req, res) => {
			//Api to Show All Rooms Availabe in hall
			res.status(200).json({
				RoomsAvailable: hallData,
			});
		})

		.post("/room", (req, res) => {
			//Api to create Unique Rooms in hall

			let result = [];
			req.body.rooms.forEach((room) => {
				let isPresent = hallData.find((temp) => temp.roomId === room.roomId);
				let roomId = room.roomId;
				if (isPresent === undefined) {
					hallData.push(room);
					console.log(room);

					result.push({ Id: roomId, status: "Created" });
				} else {
					result.push({
						Id: roomId,
						roomCreationStatus: " Room Id Already Exists!! Use Another Room Id",
					});
				}
			});

			res.status(200).json({
				roomCreationStatus: result,
			});
		})

		.get("/bookRoom", (req, res) => {
			//Api to get all booked rooms in requires format.
			let data = bookingData;

			let output = [];

			data.forEach((bookedRooms) => {
				let roomData = hallData.find(
					(room) => room.roomId === bookedRooms.roomId
				);

				let obj = {
					roomName: roomData.roomName,
					bookedStatus: bookedRooms.status,
					customerName: bookedRooms.customerName,
					date: bookedRooms.date,
					startTime: bookedRooms.startTime,
					endTime: bookedRooms.endTime,
				};

				output.push(obj);
			});

			res.status(200).json({
				bookedRooms: output,
			});
		})
		.post("/bookRoom", (req, res) => {
			//Api to book a room(Given that no rooms are booked on that date and time).

			let flag;

			let result = [];

			req.body.bookingDetails.forEach((room) => {
				flag = 1;
				let roomData = bookingData.find((rooms) => {
					if (rooms.roomId === room.roomId) {
						console.log("room id's equal");

						let bookingDate = dayjs(room.date);

						let bookedDate = dayjs(rooms.date);

						console.log(bookingDate.isSame(bookedDate));

						if (bookingDate.isSame(bookedDate)) {
							console.log("Booking date already exists");
							let bookedStartTime = +room.startTime;

							let bookedEndTime = +room.endTime;

							let bookingTime = +rooms.startTime;

							if (
								(bookingTime < bookedEndTime &&
									bookedStartTime >= bookingTime) ||
								bookingTime === bookedStartTime
							) {
								result.push({
									roomId: room.roomId,
									status: "A booking Already Exists on given time",
								});

								flag = 0;
							}
						}
					}
				});
				if (flag === 1) {
					room["status"] = "confirm";
					bookingData.push(room);
					result.push({
						roomId: room.roomId,
						status: "Booking Confirmed",
					});
				}
			});

			res.status(200).json({
				bookingStatus: result,
			});
		})
		.get("/customers", (req, res) => {
			//Api to show list of all customer with a booking
			let data = bookingData;

			let output = [];

			data.forEach((bookedRooms) => {
				let roomData = hallData.find(
					(room) => room.roomId === bookedRooms.roomId
				);

				let obj = {
					customerName: bookedRooms.customerName,
					roomName: roomData.roomName,
					date: bookedRooms.date,
					startTime: bookedRooms.startTime,
					endTime: bookedRooms.endTime,
				};

				output.push(obj);
			});

			res.status(200).json({
				customerData: output,
			});
		})

		.listen(port);
} catch (e) {
	console.error(e);
}
