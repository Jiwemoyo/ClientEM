import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  newUser: any = {
    username: '',
    email: '',
    password: '',
    role: 'user'
  };
  searchTerm: string = '';
  filteredUsers: any[] = [];
  alertMessage: string = '';
  showAlert: boolean = false;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers() {
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.getUsers(token).subscribe(
        (data: any[]) => {
          this.users = data.map(user => ({
            ...user,
            editing: false,
            editingData: { ...user }
          }));
          this.filteredUsers = this.users;
        },
        error => console.error('Error al obtener usuarios:', error)
      );
    } else {
      console.error('Token no encontrado en localStorage');
      // Puedes manejar esta situación según tus requisitos (redirigir a login, mostrar mensaje, etc.)
    }
  }

  searchUsers() {
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  editUser(user: any) {
    user.editing = true;
    user.editingData = { ...user };
  }

  cancelEdit(user: any) {
    user.editing = false;
  }

  saveUserChanges(user: any) {
    const updatedData = {
      username: user.editingData.username,
      email: user.editingData.email,
      role: user.editingData.role
    };
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.updateUser(user._id, updatedData, token).subscribe(
        () => {
          Object.assign(user, user.editingData);
          user.editing = false;
          this.showAlertMessage('Usuario de EasyMenu actualizado con éxito');
        },
        error => {
          console.error('Error al actualizar usuario:', error);
        }
      );
    } else {
      console.error('Token no encontrado en localStorage');
      // Puedes manejar esta situación según tus requisitos (redirigir a login, mostrar mensaje, etc.)
    }
  }

  deleteUser(userId: string) {
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.deleteUser(userId, token).subscribe(
        () => {
          this.users = this.users.filter(user => user._id !== userId);
          this.filteredUsers = this.filteredUsers.filter(user => user._id !== userId);
          this.showAlertMessage('Usuario de EasyMenu eliminado con éxito');
        },
        error => {
          console.error('Error al eliminar usuario:', error);
        }
      );
    } else {
      console.error('Token no encontrado en localStorage');
      // Puedes manejar esta situación según tus requisitos (redirigir a login, mostrar mensaje, etc.)
    }
  }

  createUser() {
    const token = localStorage.getItem('token');
    if (token) {
      this.userService.createUser(this.newUser, token).subscribe(
        (createdUser: any) => {
          this.users.push({
            ...createdUser,
            editing: false,
            editingData: { ...createdUser }
          });
          this.filteredUsers = this.users;
          this.resetNewUserForm();
          this.showAlertMessage('Usuario de EasyMenu creado con éxito');
        },
        error => {
          console.error('Error al crear usuario:', error);
        }
      );
    } else {
      console.error('Token no encontrado en localStorage');
      // Puedes manejar esta situación según tus requisitos (redirigir a login, mostrar mensaje, etc.)
    }
  }

  resetNewUserForm() {
    this.newUser = {
      username: '',
      email: '',
      password: '',
      role: 'user'
    };
  }

  showAlertMessage(message: string) {
    this.alertMessage = message;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }
}
