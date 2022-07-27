import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-full-screen',
  templateUrl: './image-full-screen.page.html',
  styleUrls: ['./image-full-screen.page.scss'],
})
export class ImageFullScreenPage implements OnInit {
  img:any;
  sliderOpts={
    zoom:{
      maxRatio:5,
    }
  }
  constructor(private navParams:NavParams,
    private modalCtrl: ModalController,) { }

  ngOnInit() {
    console.log(this.navParams.data.img);
    this.img = this.navParams.data.img;
  }

  zoom(zoomIn: boolean){

  }

  close(){
    this.modalCtrl.dismiss();

  }

}
