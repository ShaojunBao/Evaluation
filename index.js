class EventsModel {
    #events = [];

    constructor() {
        this.#events = [];
    }

    setEvents(events) {
        this.#events = events;
    }

    getEvents() {
        return this.#events;
    }

    addEvent(newEvent) {
        this.#events.push(newEvent);
    }

    removeEvent(id) {
        // this filter is how you remove an item from a list
        this.#events = this.#events.filter((event) => event.id !== id);
    }
}

class EventsView {
    constructor() {
        this.eventsList = document.querySelector(".events-list tbody");
        this.newEventButton = document.querySelector(".btn-add-new-event");
        this.newEventForm = document.querySelector(".new-event-form");
        this.newEventName = document.querySelector("#new-event-name");
        this.newEventStart = document.querySelector("#new-event-start")
        this.newEventEnd = document.querySelector("#new-event-end")
    }

    renderEvents(events) {
        this.eventsList.innerHTML = "";
        for (const event of events) {
            this.addEvent(event);
        }
    }

    addEvent(newEvent) {
        const { id, eventName, startDate, endDate } = newEvent;
        this.eventsList.innerHTML += `
      <tr class="event-row" id="event--${id}" data-event-name="${eventName}" data-event-start="${startDate}" data-event-end="${endDate}">
        <td>${eventName}</td>
        <td>${startDate}</td>
        <td>${endDate}</td>
        <td>
          <button class="btn-edit" data-id="${id}">Edit</button>
          <button class="btn-delete" data-id="${id}">Delete</button>
        </td>
      </tr>
    `;
    }

    removeEvent(id) {
        const eventElement = document.getElementById(`event--${id}`);
        eventElement.remove();
    }

    addNewToDo() {
        const rowId = `event--${Date.now()}`;
        this.eventsList.innerHTML += `
          <tr id="${rowId}">
            <td>
              <input type="text" class="new-event-name" placeholder="New event" />
            </td>
            <td>
              <input type="date" class="new-event-start" />
            </td>
            <td>
              <input type="date" class="new-event-end" />
            </td>
            <td>
              <button class="btn-save-event">Save</button>
              <button class="btn-cancel">Cancel</button>
            </td>
          </tr>
        `;
    }
    editEventRow(id) {
        const row = document.getElementById(`event--${id}`);
        if (!row) return;
        const currentName = row.dataset.eventName;
        const currentStart = row.dataset.eventStart;
        const currentEnd = row.dataset.eventEnd;
        row.innerHTML = `
          <td>
            <input type="text" class="edit-event-name" value="${currentName}" />
          </td>
          <td>
            <input type="date" class="edit-event-start" value="${currentStart}" />
          </td>
          <td>
            <input type="date" class="edit-event-end" value="${currentEnd}" />
          </td>
          <td>
            <button class="btn-update-event" data-id="${id}">Update</button>
            <button class="btn-cancel-edit" data-id="${id}">Cancel</button>
          </td>
        `;
    }
    replaceEventRow(updatedEvent) {
        const { id, eventName, startDate, endDate } = updatedEvent;
        const row = document.getElementById(`event--${id}`);
        if (row) {
          row.innerHTML = `
            <td>${eventName}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>
              <button class="btn-edit" data-id="${id}">Edit</button>
              <button class="btn-delete" data-id="${id}">Delete</button>
            </td>
          `;
        }
      }      
}
class EventsController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.init();
    }
    async init() {
        const events = await eventListsAPI.getAll();
        this.model.setEvents(events);
        this.view.renderEvents(events);
        this.setupAddEvent();
        this.setupCancelEvent();
        this.setupSaveEvent();
        this.setupEditEvent();
        this.setupUpdateEvent();
        this.setupDeleteEvent();
        this.setupCancelEditEvent();
    }
    setupAddEvent() {
        this.view.newEventButton.addEventListener("click", async (e) => {
            e.preventDefault();
            this.view.addNewToDo();
        });
    }
    setupCancelEvent() {
        this.view.eventsList.addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-cancel")) {
                const rowElem = e.target.parentElement.parentElement;
                const id = rowElem.id.split("--")[1];
                this.view.removeEvent(id);
            }
        });
    }
    setupSaveEvent() {
        this.view.eventsList.addEventListener("click", async (e) => {
            if (e.target.classList.contains("btn-save-event")) {
                const row = e.target.closest("tr");
                if (!row) return;
                const eventName = row.querySelector(".new-event-name").value;
                const startDate = row.querySelector(".new-event-start").value;
                const endDate = row.querySelector(".new-event-end").value;

                if (!eventName || !startDate || !endDate) {
                    alert("Please fill out all fields");
                    return;
                }
                const newEvent = await eventListsAPI.add({
                    eventName,
                    startDate,
                    endDate,
                });
                row.remove();
                this.model.addEvent(newEvent);
                this.view.addEvent(newEvent);
            }
        });
    }
    setupEditEvent() {
        this.view.eventsList.addEventListener("click", (e) => {
            if (e.target.classList.contains("btn-edit")) {
                const id = e.target.dataset.id;
                this.view.editEventRow(id);
            }
        });
    }
    setupUpdateEvent() {
        this.view.eventsList.addEventListener("click", async (e) => {
            if (e.target.classList.contains("btn-update-event")) {
                const rowElem = e.target.parentElement.parentElement;
                const id = rowElem.id.split("--")[1];
                const row = e.target.closest("tr");
                if (!row) return;
                const updatedName = row.querySelector(".edit-event-name").value;
                const updatedStart = row.querySelector(".edit-event-start").value;
                const updatedEnd = row.querySelector(".edit-event-end").value;

                if (!updatedName || !updatedStart || !updatedEnd) {
                    alert("Please fill out all fields");
                    return;
                }
                const updatedEvent = await eventListsAPI.edit(id, {
                    eventName: updatedName,
                    startDate: updatedStart,
                    endDate: updatedEnd,
                });
                this.view.replaceEventRow(updatedEvent);
            }
        });
    }
    setupDeleteEvent() {
        this.view.eventsList.addEventListener("click", async (e) => {
          if (e.target.classList.contains("btn-delete")) {
            const eventElem = e.target.parentElement.parentElement;
            const id = eventElem.id.split("--")[1];
            await eventListsAPI.deleteById(id);
            this.model.removeEvent(id);
            this.view.removeEvent(id);
          }
        });
      }
      setupCancelEditEvent() {
        this.view.eventsList.addEventListener("click", (e) => {
          if (e.target.classList.contains("btn-cancel-edit")) {
            const id = e.target.dataset.id;
            const originalEvent = this.model.getEvents().find((ev) => ev.id == id);
            if (originalEvent) {
              this.view.replaceEventRow(originalEvent);
            }
          }
        });
      }
      
      

}
const eventsModel = new EventsModel();
const eventsView = new EventsView();
const eventsController = new EventsController(eventsModel, eventsView);