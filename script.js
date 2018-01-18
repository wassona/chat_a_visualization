var data = {};
var time = "";
var chart = {};
var chat = {};

console.log(d3.dispatch)

d3.json("Hangouts.json", function(file){
	time = file.continuation_end_timestamp;
	data = file.conversation_state;


	// data.forEach(function(thing, i){

	// 	console.log(i);

	// 	thing.conversation_state
	// 		? thing.conversation_state.event[0]
	// 			? thing.conversation_state.event[0].chat_message
	// 				? thing.conversation_state.event[0].chat_message.message_content
	// 					?	thing.conversation_state.event[0].chat_message.message_content.segment
	// 						? thing.conversation_state.event[0].chat_message.message_content.segment[0]
	// 							? thing.conversation_state.event[0].chat_message.message_content.segment[0].text
	// 								? console.log(thing.conversation_state.event[0].chat_message.message_content.segment[0].text)
	// 								: console.log(thing.conversation_state.event[0].chat_message.message_content.segment[0])
	// 							: console.log(thing.conversation_state.event[0].chat_message.message_content.segment)
	// 						: console.log(thing.conversation_state.event[0].chat_message.message_content)
	// 					: console.log(thing.conversation_state.event[0].chat_message)
	// 				: console.log(thing.conversation_state.event[0])
	// 			: console.log(thing.conversation_state)
	// 		: console.log(thing)

	// })


	data = data[19].conversation_state;

	var conversation = data.conversation;
	var messages = data.event.sort(function(a,b){
		return a.timestamp - b.timestamp;
	});
	var people = {};
	var user_ids = [];

	for (var i = 0; i < conversation.participant_data.length; i++) {
		let person = conversation.participant_data[i];

		user_ids.push(person.id.gaia_id);

		person.fallback_name
		?	people[person.id.gaia_id] = person.fallback_name
		: 	people[person.id.gaia_id] = person.id.gaia_id;
	}

	// // console.log(people)
	// for (var i = messages.length - 1; i >= 0; i--) {
	// 	let message = messages[i];
	// 	console.log(`${people[message.sender_id.gaia_id]} said`);
	// 	console.log(message.chat_message.message_content.segment[0].text);
	// 	console.log(`at ${new Date(message.timestamp/1000)}`);
	// }

	var tooltip = d3.select("body")
					.append("div")
					.style("position", "absolute")
					.style("z-index", "10")
					.style("visibility", "hidden")
					.text("a simple tooltip");

	var chart = {};

	chart.svg = d3.select('#chart')
		.append('svg')
		.attr('width', 2000)
		.attr('height', 600)
		.append('g');

	chart.x = d3.scaleLinear()
				.domain([
						d3.min(messages, (d)=>{return d.timestamp}),
						d3.max(messages, (d)=>{return d.timestamp})
					])
				.range([0,2000]);

				// console.log(chart.x("1515431154294743"))

	chart.y = d3.scalePoint()
				.domain(user_ids)
        		 .rangeRound([0, 600]); 


        		 console.log(user_ids)
				// console.log(chart.y("113283693557354840478"))

	var posts = chart.svg.selectAll('.post')
					.data(messages)
					.enter().append('circle')
					.attr('class', 'post')
					.attr('r', .5)
					.style('stroke', 'black')
					.style('fill', 'black')
					.attr('cx', (d)=>{return chart.x(d.timestamp)})
					.attr('cy', (d)=>{return chart.y(d.sender_id.gaia_id)})
					.on("mouseover", function(d){
												tooltip.style("visibility", "visible")
														.text(d.chat_message.message_content.segment[0].text);
											})
					.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
					.on("mouseout", function(){return tooltip.style("visibility", "hidden");});

	var chat = {};

	chat.options = {
		change: function(d) {
			return document.createTextNode(`${people[d.membership_change.participant_id.gaia_id]}  ${d.membership_change.type === "JOIN" ? 'joined' : 'left'} at ${new Date(d.timestamp/1000)}`);		
		},
		rename: function(d) {
			return document.createTextNode(`${people[d.sender_id.gaia_id]} renamed the chat to ${d.conversation_rename.new_name} from ${d.conversation_rename.old_name} at ${new Date(d.timestamp/1000)}`);
		},
		event: function(d) {
			return document.createTextNode(`${people[d.hangout_event.participant_id.gaia_id]} performed event ${d.hangout_event.event_type} at ${new Date(d.timestamp/1000)}`);
		},
	};

	chat.window = d3.select('.chat-window');

	chat.posts = chat.window.selectAll('.chat-post')
								.data(messages)
								.enter().append('div')
								.attr('class', 'chat-post')
								.append((d,i,nodes)=>{
									console.log('nodes =')
									console.log(nodes[i])
									if (d.membership_change) {
										return chat.options.change(d);
									} else if (d.conversation_rename) {
										return chat.options.rename(d);
									} else if (d.hangout_event) {
										return chat.options.event(d);
									} else if (d.chat_message.message_content.attachment) {
										if (d.chat_message.message_content.attachment[0].embed_item.id) {
											return document.createTextNode('' + d.chat_message.message_content.attachment[0].embed_item.id)
										} else {
											return document.createTextNode('' + d.chat_message.message_content.attachment[0].embed_item["embeds.PlusPhoto.plus_photo"].thumbnail.image_url)
										}
									} else if (d.chat_message){
										if (d.chat_message.message_content.segment[1]) {
											// console.log(d.chat_message.message_content.segment.length)
											// console.log(d)
										}
										return document.createTextNode(`${people[d.sender_id.gaia_id]} said: ${d.chat_message.message_content.segment[0].text} on ${new Date(d.timestamp/1000)}`)
									} else {
										// console.log(d)
									}
								});
								

})