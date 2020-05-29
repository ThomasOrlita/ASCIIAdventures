GAME.levels = [
  new Level({
    index: 0,
    template: `









                     ____
               o    /      _
               ____/        \\
                             \\         P
                              \\__  _____
               
`,
    customText: {
      text: `
      Welcome to ASCII Adventures!
      
      Move around using WASD or arrows.
      Jump by pressing SPACE.
      Shoot using R.`,
      position: {
        x: 10,
        y: 400
      }
    }
  }),

  new Level({
    index: 1,
    template: `












            o                   Q           P
            _________________________________

`
  }),

  new Level({
    index: 2,
    template: `











                                                     P
                                              ________
    o                  _____                 /
    __________________/Q                    /
                            _______________/
    

`
  }),
  new Level({
    index: 3,
    template: `
       -----------------------------------------
      ]                                         [
      ]o                                       Q[
      ]__        ))          Q                * [
      ]  \\______/  \\______________________   ___[
      ]                                     /   [
      ]             Q                           [
      ]  ________________________________    z  [
      ]    Q        +                    \\______[
      ]    Q       __       _      ___          [
      ]         _       Q         /   \\_______  [
      ]________/ \\_______________/              [
      ]Q                                   _____
      ]                           ________/
      ]Q                 ___   __/
      ]Q       )__   _
      ]    _
      ]   /
      ]   \\[
      ]    [
      ]__  [
      ]    [WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW
      ]    __________________________________[
      ]                                      [
      ]                       _           P  [
       ______________________/ \\_____________

`
  }),
  new Level({
    index: 4,
    template: `
         -------------------I                -----
        ]                   KI                    [
        ] o                  QI          ___/     [
        ]         __[         \\_________/         [
        ]        /  [                             [
        ]       /   [                      ____   [
         ______/    ______________________/       [
                    ______/Q                      [
                   /                _____________/[
        ]_________/    ____________/  \\[*        Q[
        I +           /          \\___________    _I
         \\______             Q               \\  /
          \\     \\______________________        /
           \\                           \\   ___/
            \\__________________________/  /
                        KQ               /
                                        /
                                      ]/
                                      ]
             Q                        ]
            _ P       _   _       _   ]
             \\_______/     \\_____/    ]

`
  }),
  new Level({
    index: 5,
    template: `



   o
  __
H/                    
H            _______H  
H           /       H             
H     Z             H          ____))
H                   H         /                     (
H       K                                 Q        {
H                     ZZ                  Z       {
H                                         |      {
H                                        {|     {
(((((((((((((((((((((((((((((((((((((((({_     {
                                              {    
         Q          +                        {
                  K K                       {
P                                          {
_(____(_))     ZH                        ({
                H          ()          
                H         {  }
                H                ZZZZZ                         
                H_       _ 
                  \\_____/
        `
  }),
  new Level({
    index: 6,
    template: `
                                                  [            
                                             \\    [         
                                              \\   [          
                                               \\  [           
                                                \\[[             
                                                 [[            I 
                                                 [[            I 
                                                 [[       S    I
                                                 II+      _   PI
                      _____       ______________/ \\_     / \\___I
                     /     \\    ]/                  \\   /    
                    /       \\_[ ]                      /     
                   /            I                     /   
             _____/          ___/   Z ]              / 
o           /               {         ]             /          
___        /               {     Z    ]            /      
I  \\_   __/               {           ]           /          
I    \\_/                 {         Z  ]          /         
I                       {             ]         /              
I                      {             ZI________/               
I                     {          ]____/     KK]                
I       (   _        {       Z   ]       +    ]                  
I            -  __  {        _   ]            ]                
I                  {            Z]       Z    ]                 
I        WWWWWWWWWW             _             ]                 
IZ                           Z        Z       ]                 
                           _ _                ]                 
                        _           Z         I              
           Z((((((((((((((((((((((((_))))))))){                       
`
  }),

  new Level({
    index: 7,
    template: `




    I                                       I
    I                                       I
    I                                       I
    I                 Q                   _HI
    I                Q Q                 { HI
     P              Q   Q               {+ HI
 IIII(((((((((((((((((((((((((((((((((({\\  HI
 I                                       \\[HI
 I                                        [HI
 I                                        [HI
 I                                        [HI
 I               Z  Z  Z  Z  Z  Z  Z      [HI
 I               K  K  K  K  K  K  K     Z HI
 I                                      /  HI
 I                                     /   HI
  \\[   ]/           _                 /    HI
   [   ]                             /+    HI
   [   ]       Z                    /      HI
   [   ]  o   /Q                Q  /       HI
   [   I_____/WWWWWW______________/*       HI
   [                                        I         
   I                                        I
   \\_______________________________________ZI


        `
  }),
  new Level({
    index: 8,
    template: `
    
          I               KKKKKKKKKKKK    KKKKKKKKKKKK
          I
          Io      
           \\    Q
            \\    Q
             \\    Q
              \\    Q               
               \\    Q
                \\    Q
                 \\    Q            
                  \\    Q  
                   \\      +             +
                    \\_____                            ___    
                    Q                                 Q  \\   
                          KKKKKKKKKKKK    KKKKKKKKKKKK        
                                                              
                                                             
                                                             
                                                            
                                                             
                                                             
                                                           ]\\ /|
                                                         + ]| ]|
                                                           ]| ]|
                                                           ]| ]|
                                                         z ]| ]|
                                                         --II ]| 
                                                           /  ]| 
                                                         P    ]|
                                                         ______   
        `
  }),
];
