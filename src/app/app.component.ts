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
  form!: FormArray<FormGroup>;

  constructor() {
    this.store.select(selectUsers)
      .subscribe((users) => {
        this.initializeForm(users);
      });
  }

  initializeForm(users: User[]) {
    if (users.length > 0) {
      this.form = this.fb.array(users.map(user => this.buildFormGroup(user)));
    }

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

  buildFormGroup(user?: User): FormGroup {
    return this.fb.group({
      id: [user?.id ?? 0],
      firstName: [user?.firstName, [Validators.required]],
      lastName: [user?.lastName, [Validators.required]],
      dropDown: [user?.dropDown, [Validators.required]],
      position: [user?.position]
    });
  }

  addNewForm(index: number) {
    this.form.insert(index + 1, this.buildFormGroup());
  }

  deleteForm(index: number) {
    this.form.removeAt(index);
  }

  moveUp(index: number) {
    const currentForm = this.form.controls[index];
    const targetForm = this.form.controls[index - 1];

    this.form.controls[index - 1] = currentForm;
    this.form.controls[index] = targetForm;
  }

  moveDown(index: number) {
    const newIndex = index + 1;
    const currentForm = this.form.controls[index];
    const targetForm = this.form.controls[newIndex];

    this.form.controls[newIndex] = currentForm;
    this.form.controls[index] = targetForm;
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

  trackByUserId(_: number, userForm: FormGroup) {
    return userForm.value.id;
  }
}
