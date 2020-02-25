import { NgModule } from '@angular/core';
import { MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule,
    MatListModule,
    MatExpansionModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatRadioModule,
    MatCheckboxModule,
    MatProgressBarModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    exports: [
        BrowserAnimationsModule,
        MatButtonModule,
        MatIconModule,
        MatToolbarModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatSnackBarModule,
        MatListModule,
        MatExpansionModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatChipsModule,
        MatRadioModule,
        MatCheckboxModule,
        MatProgressBarModule
    ],
})
export class CommonMaterialModules { }
