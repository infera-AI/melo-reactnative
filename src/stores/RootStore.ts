import UserStore from './UserStore';

class RootStore {
  userStore: UserStore;

  constructor() {
    this.userStore = new UserStore();
  }
}

export default RootStore; 