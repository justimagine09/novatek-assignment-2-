import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUsers, userActions } from './store/user';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from './interfaces';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule],
  providers: [TitleCasePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  store = inject(Store);
  fb = inject(FormBuilder);
  form!: FormArray<FormGroup>;
  hasUnSaveData = false;
  deletedUsers: FormGroup[] = [];

  constructor() {
    this.store.select(selectUsers)
      .subscribe((users) => {
        this.initializeForm(users);

        this.form.valueChanges.pipe(debounceTime(10))
          .subscribe(() => {
            this.hasUnSaveData = this.form.controls.some((item) => item.value.unSaved);
          });
      });
  }

  addNewForm(index: number) {
    this.form.insert(index + 1, this.buildFormGroup());
  }

  editForm(userForm: FormGroup) {
    userForm.patchValue({unSaved: true});
  }

  deleteForm(index: number) {
    const userForm = this.form.controls[index];
    this.form.removeAt(index);

    if (userForm.value.id) {
      this.deletedUsers.push(userForm);
    }

    // If there is no user left in the array re-initialize the form a placeholder form control
    if (this.form.controls.length == 0) {
      this.initializeForm([]);
    }
  }

  moveUp(index: number) {
    const currentForm = this.form.controls[index];
    const targetForm = this.form.controls[index - 1];

    this.form.controls[index - 1] = currentForm;
    this.form.controls[index] = targetForm;

    // If there is no un-saved data save new positions
    if (!this.hasUnSaveData) {
      this.save();
    }
  }

  moveDown(index: number) {
    const newIndex = index + 1;
    const currentForm = this.form.controls[index];
    const targetForm = this.form.controls[newIndex];

    this.form.controls[newIndex] = currentForm;
    this.form.controls[index] = targetForm;

    // If there is no un-saved data save new positions
    if (!this.hasUnSaveData) {
      this.save();
    }
  }

  removeUser(userForm: FormGroup) {
    this.store.dispatch(userActions.remove({payload: userForm.value}));
  }

  showSaveButton() {
    return (this.form.valid && this.hasUnSaveData) || this.deletedUsers.length;
  }

  save() {
    if (!this.form.valid) return;

    const values = this.form.controls.map((item, index) => {
      const value = item.value as User;
      return {
        firstName: value.firstName,
        lastName: value.lastName,
        dropDown: value.dropDown,
        position: index
      } as User;
    });
    
    this.store.dispatch(userActions.upserts({payload: values}));
    this.hasUnSaveData = false;
    this.deletedUsers = [];
  }

  trackByUserId(_: number, userForm: FormGroup) {
    return userForm.value.id;
  }

  validateFormControl(userForm: FormGroup, controlName: string) {
    return userForm.get(controlName)!.invalid && userForm.get(controlName)!.touched;
  }

  private initializeForm(users: User[]) {
    if (users.length > 0) {
      this.form = this.fb.array(users.map(user => this.buildFormGroup(user)));
      return;
    }

    const placeholder = this.buildFormGroup({
      id: 0,
      firstName: '',
      lastName: '',
      dropDown: null,
    });

    this.form = this.fb.array([
      placeholder,
      ...users.map(user => this.buildFormGroup(user))
    ]);
  }

  private buildFormGroup(user?: User): FormGroup {
    return this.fb.group({
      id: [user?.id ?? 0],
      firstName: [user?.firstName, [Validators.required]],
      lastName: [user?.lastName, [Validators.required]],
      dropDown: [user?.dropDown ?? null, [Validators.required]],
      unSaved: [!user?.id]
    });
  }
}
