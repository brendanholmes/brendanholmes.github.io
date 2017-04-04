function [label, dist] = assignPixels(im, C, k, S, label, dist)

    height = size(im, 1);
    width = size(im, 2);
    COMPACTNESS = 2; % DEFAULT = 10
    m = S*COMPACTNESS;

for clus = 1:k % for each cluster in a 2S*2S square around pixel
    for i = (C(clus, 4)-round(2*S)):(C(clus, 4)+round(2*S))
        
        row = i;
        
        if (i>height) 
            row = height; % bind indeces to inside image
            %continue;
        end 
        
        if (i<=0) 
            row = 1; % bind indeces to inside image
        end 
        
        for j = (C(clus, 5)-round(2*S)):(C(clus, 5)+round(2*S))
            
            col = j;
            
            if (j>width) 
                col=width; 
                % continue;
            end
            
            if (j<=0) 
                col = 1; 
            end
            
            % don't need this line if we change the 2 after it to index im
            % directly
            px = [reshape(im(row, col, :),1 , 3), row, col];
            
            % creating a weighting between colour and proximity
            dc = sqrt((C(clus,1)-px(1))^2 + (C(clus,2)-px(2))^2 + +(C(clus,3)-px(3))^2);
            ds = sqrt((C(clus,4)-px(4))^2 + (C(clus,5)-px(5))^2);

            D = sqrt(dc^2 + (ds/S)^2*m^2);
            
            if D<dist(row, col) % if distance to new cluster is less than current closest
                dist(row,col) = D; % set distance to new distance
                label(row, col) = clus; % set label to closer cluster
            end % end if
        end % end column loop
    end % end row loop
end % end cluster loop

%workaround 
    
end