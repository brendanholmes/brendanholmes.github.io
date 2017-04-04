function centreList = initCentres(im, k, S)
    
    height = size(im, 1);
    width = size(im, 2);
    centreList = zeros(k, 5);
    idx = 1;
    
for i = 1:ceil(height/S) % number of rows of squares
    for j = 1:ceil(width/S) % number of columns of squares
        
        row = round(S*i - S/2);
        col = round(S*j - S/2);
        
        % if new centre exceeds boundaries, set it to halfway between
        % boundary and previous centre
        if row>height 
            row = ceil((height - (row-S))/2);
        end
        
        if col>width
            col = ceil((width - (col-S))/2);
        end
        
        centreList(idx, :) = [reshape(im(row, col, :), 1, 3), row, col];
        idx = idx + 1;
        
        %%                                
        % "Move cluster centers to the lowest gradient position in a 3 x 3 
        % neighborhood."
        %SKIP FOR NOW

    end
end

end