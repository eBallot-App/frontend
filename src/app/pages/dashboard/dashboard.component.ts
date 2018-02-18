import {Component, OnInit, ViewChild} from '@angular/core';
import {LocalStorageService} from 'angular-2-local-storage';
import {ElectionService} from '../../services/election.service';
import {BallotService} from '../../services/ballot.service';
import {SuiModalService, TemplateModalConfig, ModalTemplate} from 'ng2-semantic-ui';
import {BallotModel} from '../../models/ballot-model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('ballotModalTemplate')
  public ballotModalTemplate: ModalTemplate<BallotModel, any, any>;

  election: any;

  ballots: any;

  constructor(
    private localStorage: LocalStorageService,
    private electionService: ElectionService,
    private ballotService: BallotService,
    public modalService: SuiModalService
  ) { }

  ngOnInit() {
    const election_id: string = this.localStorage.get('election');
    this.electionService.getDocument(election_id)
      .subscribe(data => {
        this.election = data;
        this.election.id = election_id;
        this.retrieveBallots();
      });
  }

  private retrieveBallots() {
    const election_id = this.election.id;
    this.ballotService.getBallots(election_id)
      .subscribe(data => {
        const ballots = [];
        for (let i = 0; i < data.length; i++) {
          const ballot = data[i];
          ballots[i] = {
            id: ballot.payload.doc.id,
            name: ballot.payload.doc.data().name,
            description: ballot.payload.doc.data().description,
            type: ballot.payload.doc.data().type,
            options: ballot.payload.doc.data().options
          };
        }
        this.ballots = ballots;
        console.log(this.ballots);
      });
  }

  viewBallot(uid: string) {
    const ballot = this.ballots.filter(data => data.id === uid)[0];
    console.log(ballot);
    const config = new TemplateModalConfig<BallotModel, any, any>(this.ballotModalTemplate);
    config.context = {
      id: ballot.id,
      name: ballot.name,
      description: ballot.description,
      type: ballot.type,
      options: ballot.options
    };

    this.modalService
      .open(config);
  }

  deleteBallot(uid: string) {
    this.ballotService.deleteBallot(this.election.id, uid);
  }
}