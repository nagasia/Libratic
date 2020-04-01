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
    MatProgressBarModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatMenuModule} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    exports: [
        BrowserAnimationsModule,
        FlexLayoutModule,
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
        MatProgressBarModule,
        MatDatepickerModule,
        MatSlideToggleModule,
        MatMenuModule
    ],
})
export class CommonMaterialModules { }
