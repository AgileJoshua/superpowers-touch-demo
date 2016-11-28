class TouchBehavior extends Sup.Behavior {
  
  //four finger controls... not performance optimized
  
  private trackTouchIdentifier : number = null;
  private rayCaster = new Sup.Math.Ray();
  private camera : Sup.Camera;
  private tapStart = 0;
  private fireStart = 0;
  private isFiring = false;
  private movementPlane : Sup.Math.Plane;
  
  awake() {
    this.camera = Sup.getActor("Camera").camera; 
    this.movementPlane = new Sup.Math.Plane(Sup.Math.Vector3.forward(),0);
  }

  update() { 
    if(this.isFiring && Date.now() - this.fireStart > 200){
      this.isFiring = false;
      this.fireStart = 0;
      this.actor.spriteRenderer.setAnimation("Idle");
    }
    
    if(this.trackTouchIdentifier == null){
      //track touchstart to lock finger
      if(Sup.Input.wasTouchJustStarted()){
        Sup.Input.getTouchesStarted().forEach(identifier=>{
          if(this.trackTouchIdentifier == null){
            let screenPos = Sup.Input.getTouchPosition(identifier);
            this.rayCaster = this.rayCaster.setFromCamera(this.camera,screenPos);
            if(this.rayCaster.intersectActor(this.actor).length > 0){
              this.trackTouchIdentifier = identifier;
              this.tapStart = Date.now();
              
        Sup.log(`start: ${this.trackTouchIdentifier}`);
            }
          }
        });
      }
    }
    else{
      //track my touch position and follow while moving.
      if(Sup.Input.wasTouchJustMoved(this.trackTouchIdentifier)){
        let screenPos = Sup.Input.getTouchPosition(this.trackTouchIdentifier);
        this.rayCaster = this.rayCaster.setFromCamera(this.camera,screenPos);
        let pos = this.rayCaster.intersectPlane(this.movementPlane);
        this.actor.setPosition(pos.point);
      }
      
    //short tap on item (start and stop within 300ms) fires item
      let justEnded = Sup.Input.wasTouchJustEnded(this.trackTouchIdentifier);
      let isDown = Sup.Input.isTouchDown(this.trackTouchIdentifier);
      if(justEnded || !isDown){
        let tapEnd = Date.now();
        if(tapEnd - this.tapStart < 300){
          this.isFiring = true;
          this.fireStart = Date.now();
          this.actor.spriteRenderer.setAnimation("Fire");
        }
        this.tapStart = 0;
        
        Sup.log(`stop: ${this.trackTouchIdentifier}`);
        Sup.log(`ended: ${justEnded}`);
        Sup.log(`isDown: ${isDown}`);
        this.trackTouchIdentifier = null;
      }
    }
    

    
    
  }
}
Sup.registerBehavior(TouchBehavior);
