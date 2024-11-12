import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUsers, userActions } from './store/user';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from './interfaces';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  store = inject(Store);
  fb = inject(FormBuilder);
  form!: FormArray;

  constructor() {
    this.store.select(selectUsers)
      .subscribe((users) => {
        console.log(users);
        this.initializeForm(users);
      });
  }

  initializeForm(users: User[]) {
    const placeholder = this.buildFormGroup({
      id: 0,
      firstName: '',
      lastName: '',
      dropDown: '',
      position: 0
    });

    this.form = this.fb.array([
      placeholder,
      ...users.map(user => this.buildFormGroup(user))
    ]);
  }

  buildFormGroup(user: User): FormGroup {
    return this.fb.group({
      id: [user.id],
      firstName: [user.firstName, [Validators.required]],
      lastName: [user.lastName, [Validators.required]],
      dropDown: [user.dropDown, [Validators.required]],
      position: [user.position]
    });
  }

  addUser(userForm: FormGroup) {
    if (userForm.invalid) {
      userForm.markAsTouched();
      return;
    }

    this.store.dispatch(userActions.add({payload: userForm.value}));
  }

  removeUser(userForm: FormGroup) {
    this.store.dispatch(userActions.remove({payload: userForm.value}));
  }

  updateUser(userForm: FormGroup) {
    if (userForm.invalid) {
      userForm.markAsTouched();
      return;
    }
    
    this.store.dispatch(userActions.update({payload: userForm.value}));
  }
}
