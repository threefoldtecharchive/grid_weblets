import { writable } from "svelte/store";

interface INotification {
  type: "info" | "success" | "danger";
  message: string;
}

interface IStore {
  notifications: INotification[];
}

function createNotificationStore() {
  const store = writable<IStore>({
    notifications: [],
  });

  const { subscribe, update } = store;

  return {
    subscribe,
    notify(type: INotification["type"], message: string, time_ms = 3000) {
      const notification: INotification = { type, message };
      update(value => {
        value.notifications.push(notification);
        return value;
      });

      setTimeout(() => {
        update(value => {
          value.notifications = value.notifications.filter(n => n !== notification); // prettier-ignore
          return value;
        });
      }, time_ms);
    },
  };
}

export default createNotificationStore();
