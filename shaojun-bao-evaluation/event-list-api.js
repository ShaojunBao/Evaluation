const eventListsAPI = (() =>{
    const EVENT_API = "http://localhost:3000/events"

// GET 
    const getAll = async () =>{
        const response = await fetch(EVENT_API);
        const events = await response.json();
        return events;
    }

// POST
    const add = async(newEvent) => {
        const response = await fetch(EVENT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newEvent),
        });
        const event = await res.json();
        //get id of new event
        return event;
    }


  const edit = async (id, updatedTodo) => {
    await fetch(`${EVENT_API}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTodo),
    });
  };

  // DELETE
  const deleteById = async (id) => {
    await fetch(`${EVENT_API}/${id}`, {
      method: "DELETE",
    });
  };

  return {
    getAll,
    add,
    edit,
    deleteById,
  };
})();