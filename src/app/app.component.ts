import { CommonModule, TitleCasePipe } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUsers, userActions } from './store/user';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from './interfaces';
import { debounceTime, interval, Subject, Subscription, take, takeUntil } from 'rxjs';
import { UserFormTableColumnSortDirective } from './directives/user-form-table-column-sort.directive';
import { DROP_DOWN_OPTIONS } from './constants/drop-down';
import { DropdownIdToTextPipe } from './pipes/dropdown-id-to-text.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule, UserFormTableColumnSortDirective, DropdownIdToTextPipe],
  providers: [TitleCasePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnDestroy {
  readonly store = inject(Store);
  readonly fb = inject(FormBuilder);
  readonly dropDownOptions = DROP_DOWN_OPTIONS;

  form!: FormArray<FormGroup>;
  hasUnSaveData = false;
  deletedUsers: FormGroup[] = [];
  onDestroy$$ = new Subject();
  formChangesSubscription?: Subscription;

  constructor() {
    this.store.select(selectUsers)
      .pipe(takeUntil(this.onDestroy$$))
      .subscribe((users) => {
        this.initializeForm(users);

        /**
         * Every changes check if has unSaved data
         */
        this.formChangesSubscription = this.form.valueChanges.pipe(debounceTime(10))
          .subscribe(() => {
            this.hasUnSaveData = this.form.controls.some((item) => item.value.unSaved);
          });
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$$.next(true);
    this.onDestroy$$.complete();
    this.formChangesSubscription?.unsubscribe();
  }

  addNewForm(index: number) {
    const position = index + 1;
    this.form.insert(position, this.buildFormGroup());
    this.updatePositions();
  }

  editForm(userForm: FormGroup) {
    userForm.patchValue({ unSaved: true });
  }

  deleteForm(index: number) {
    const userForm = this.form.controls[index];
    this.form.removeAt(index);
    this.updatePositions();

    if (userForm.value.id) {
      this.deletedUsers.push(userForm);
    }

    // If there is no user left in the array and no deletedUsers, re-initialize the form to have a placeholder form control
    if (this.form.controls.length == 0 && !this.deletedUsers) {
      this.initializeForm([]);
    }
  }

  moveUp(index: number) {
    const newIndex = index - 1;
    const currentForm = this.form.controls[index];
    const targetForm = this.form.controls[newIndex];

    this.form.controls[newIndex] = currentForm;
    this.form.controls[index] = targetForm;
    currentForm.patchValue({ position: newIndex });
    targetForm.patchValue({ position: index });

    // If there is no un-saved data save the new positions
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
    currentForm.patchValue({ position: index });
    targetForm.patchValue({ position: newIndex });

    // If there is no un-saved data save the new positions
    if (!this.hasUnSaveData) {
      this.save();
    }
  }

  showSaveButton() {
    return (this.form.valid && this.hasUnSaveData) || (this.deletedUsers.length && this.form.valid);
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

    this.store.dispatch(userActions.upserts({ payload: values }));
    this.hasUnSaveData = false;
    this.deletedUsers = [];
  }

  trackByUserId(_: number, userForm: FormGroup) {
    return userForm.value.id;
  }

  validateFormControl(userForm: FormGroup, controlName: string) {
    console.log(userForm.get(controlName));
    return userForm.get(controlName)!.invalid && userForm.get(controlName)!.touched;
  }

  private initializeForm(users: User[]) {
    // Create a place holder form if there is no users
    if (users.length > 0) {
      this.form = this.fb.array(users.map(user => this.buildFormGroup(user)));
      return;
    }

    const placeholder = this.buildFormGroup({
      id: 0,
      firstName: '',
      lastName: '',
      dropDown: null,
      position: 0
    });

    this.form = this.fb.array([
      placeholder,
      ...users.map((user, index) => this.buildFormGroup({ ...user, position: index + 1 }))
    ]);
  }

  private buildFormGroup(user?: User): FormGroup {
    return this.fb.group({
      id: [user?.id ?? 0],
      firstName: [user?.firstName, [Validators.required]],
      lastName: [user?.lastName, [Validators.required]],
      dropDown: [user?.dropDown ?? null, [Validators.required]],
      position: [user?.position ?? 0],
      unSaved: [!user?.id]
    });
  }

  private updatePositions() {
    this.form.controls.forEach((item, index) => {
      item.patchValue({ position: index }, { emitEvent: false });
    });
  }
}
