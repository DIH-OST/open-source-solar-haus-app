import { ToastController } from '@ionic/angular';

export class ToastHelper {

    private toastController: ToastController = new ToastController();

    constructor() { }

    public async presentToast(message: string, color: string = "primary") {
        const toast = await this.toastController.create({
            message: message,
            duration: 2000,
            color: color
        });
        toast.present();
    }
}