import { stateset } from '../../stateset-client';

class Users {
  constructor(private stateset: stateset) {}

  async list() {
    return this.stateset.request('GET', 'users');
  }

  async get(userId: string) {
    return this.stateset.request('GET', `users/${userId}`);
  }

  async create(userData: any) {
    return this.stateset.request('POST', 'users', userData);
  }

  async update(userId: string, userData: any) {
    return this.stateset.request('PUT', `users/${userId}`, userData);
  }

  async delete(userId: string) {
            return this.stateset.request('DELETE', `users/${userId}`);
  }

}

export default Users;