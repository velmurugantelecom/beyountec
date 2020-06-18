import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CoreService } from 'src/app/core/services/core.service';
import { NgxSpinner } from 'ngx-spinner/lib/ngx-spinner.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-request-redirect',
  templateUrl: './request-redirect.component.html',
  styleUrls: ['./request-redirect.component.scss']
})
export class RequestRedirectComponent implements OnInit {
  public DocUploadForm: FormGroup;

  public quoteNo: string;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private coreService: CoreService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    // this.route.queryParams.subscribe(params => {
    //   this.quoteNo = params['quoteNo']
    // })
  }
  public fileContainer = []


  ngOnInit() {

    this.DocUploadForm = this.fb.group({})

    this.getUploadedDocs();
  }


  // get mandatory docs
  getDocuments() {
    let body = {
      quoteId: "1353656",
      loadAllDocs: "N"
    }
    this.coreService.postInputs('brokerservice/documentupload/getUploadDocName', {}, body).subscribe((response: any) => {
      if (response) {

        response.forEach((element, index) => {
          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          this.fileContainer = [{
            id: element.polDoId,
            label: element.polDocDes,
            controlName: `documentName${index + 1}`,
            value: ''
          }]

        });

      }

    });
  }

  addMoredDocuments() {
    let params = {
      quoteId: '1353656',
      loadAllDocs: 'Y'
    }
    this.coreService.postInputs('brokerservice/documentupload/getUploadDocName', {},params).subscribe((response: any) => {
      if (this.fileContainer.length == 1) {
        response.forEach((element, index) => {

          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          this.fileContainer.push(
            {
              id: element.polDoId,
              label: element.polDocDes,
              controlName: `documentName${index + 1}`,
              value: ''
            }
          )

        })
      } else {

        let shallowcopy = this.fileContainer.slice();
        let value = shallowcopy.splice(1);
        const result = response.filter(({ polDoId }) => !value.some(x => x.id == polDoId));

        result.forEach((element, index) => {

          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          this.fileContainer.push(
            {
              id: element.polDoId,
              label: element.polDocDes,
              controlName: `documentName${index + 1}`,
              value: ''
            }
          )

        })

      }
    });





  }

  doNavigate() {
  }


  //  get Uploaded List docs
  getUploadedDocs() {
    let params = {
      quotenumber: "1353656"
    }
    this.coreService.getInputs('brokerservice/documentupload/uploadedDocs', params).subscribe((result: any) => {

      if (result.length > 0) {

        let sortedArray: any[] = result.sort((n1, n2) => n1.docId - n2.docId);
        sortedArray.forEach((element, index) => {
          this.DocUploadForm.addControl(`documentName${index + 1}`, new FormControl('', (element.mandatoryYN && element.mandatoryYN == 'Y' ? Validators.required : [])));
          this.fileContainer.push(
            {
              id: element.docId,
              // label: element.polDocDes,
              controlName: `documentName${index + 1}`,
              value: element.fileName || null
            }
          )
        });

      }
      else {
        this.getDocuments()
      }



    });
  }




  selectFile(event, docId, i) {
    let selectedFileName = event.srcElement.files[0].name;
    const formData = new FormData();
    formData.append('files', event.target.files[0], selectedFileName);
    formData.append('doctypeid', docId);
    formData.append('docDesc', selectedFileName);
    formData.append('quotenumber', "Q/1113/2/20/3006669");
    this.coreService.postInputs('brokerservice/documentupload/uploadMultipleFiles', formData, null).subscribe(response => {

      this.fileContainer[i].value = selectedFileName;
    })

  }


}
